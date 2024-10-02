from numpy import random
import numpy as np
import json
import requests
from sqlalchemy import Boolean
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast

from dallinger.models import Info
from dallinger.models import Transformation
from dallinger.nodes import Agent, Source
from dallinger.networks import Empty
from operator import attrgetter
import os

class Empty_custom(Empty):

    __mapper_args__ = {"polymorphic_identity": "empty"}

    def add_node(self, node):
        """Connect new nodes to the source."""
        source = min(self.nodes(), key=attrgetter("id"))
        source.connect(whom=node)


class ProbeAgent(Agent):

    __mapper_args__ = {"polymorphic_identity": "ProbeAgent"}

    def __init__(self, network, participant): 
        super(ProbeAgent, self).__init__(network, participant)

    def update(self, infos):
        info = infos[0]
        self.replicate(info)
        self.infos(failed="all")[0].details = infos[0].details


class VGMCPAgent(Agent):

    __mapper_args__ = {"polymorphic_identity": "VGMCPAgent"}

    def __init__(self, network, participant, details): 
        super(VGMCPAgent, self).__init__(network, participant)
        self.details = details

    def update(self, infos):
        info = infos[0]
        self.replicate(info)
        new_content, new_detail = info.perturbed_contents()
        new_info = FaceInfo(origin=self, contents=new_content, details=new_detail)
        # Perturbation(info_in=info, info_out=new_info)

    def _what(self):
        infos = self.infos()
        return [i for i in infos if i.chosen][0]


class vgmcpSource(Source):
    """A source that transmits facial expression."""

    __mapper_args__ = {"polymorphic_identity": "vgmcp_Source"}

    # start points of Chains of happy, sad and neutral
    startPoint = {
        "happy": [3.00, -3.13, -2.78],
        "sad": [-0.69, 1.80, 1.78],
        "neu": [1.70, 2.43, -0.48],
    }

    def create_information(self):
        """Create a new Info.

        transmit() -> _what() -> create_information().
        """
        data = {}
        key = self.network.role.split("_")[1]
        cov = np.identity(3)
        sample = random.multivariate_normal(self.startPoint[key], cov, 1)
        data["face"] = requests.post('http://4.156.210.143:3000/generate', json={"data": sample.tolist()}).json()
        data["loc"] = sample.squeeze().tolist()

        return FaceInfo(origin=self, contents=json.dumps(data))


class FaceInfo(Info):
    """An Info that can be chosen."""

    __mapper_args__ = {"polymorphic_identity": "vector_info"}

    
    def pdf(self, x, emotion):
        if emotion == "happy":
            covariance = np.array([[1.51, -0.21, -0.01], [-0.21, 1.10, 0.19], [0, 0.19, 1.14]])
            mean = np.array([3.0, -3.13, -2.78])
        elif emotion == "sad":
            covariance = np.array([[2.07, -0.38, -0.70], [-0.38, 1.17, -0.47], [-0.70, -0.47, 1.25]])
            mean = np.array([-0.69, 1.80, 1.78])
        else:
            covariance = np.array([[1.62, 0.43, -0.28], [0.43, 1.05, 0.02], [-0.28, 0.02, 1.21]])
            mean = np.array([1.70, 2.43, -0.48])

        term1 = 1 / np.sqrt((2 * np.pi)**3 * np.linalg.det(covariance))
        term2 = np.exp(-0.5 * np.dot(np.dot((x - mean).T, np.linalg.inv(covariance)), 
            (x - mean)))
        return term1 * term2


    @hybrid_property
    def chosen(self):
        """Use property1 to store whether an info was chosen."""
        try:
            return bool(self.property1)
        except TypeError:
            return None

    @chosen.setter
    def chosen(self, chosen):
        """Assign chosen to property1."""
        self.property1 = repr(chosen)

    @chosen.expression
    def chosen(self):
        """Retrieve chosen via property1."""
        return cast(self.property1, Boolean)

    def perturbed_contents(self):
        """Perturb the given face."""
        data = json.loads(self.contents)
        proposal = np.identity(3) * 4
        pp = 0.5  # power prior 
        emotion = self.network.role.split("_")[1]

        sample = random.multivariate_normal(data["loc"], proposal, 1)
        rnd = random.rand(1)
        n_samples = 1
        while self.pdf(sample.squeeze(), emotion)**pp / (self.pdf(data["loc"], emotion)**pp + self.pdf(sample.squeeze(), emotion)**pp) < rnd:
            sample = random.multivariate_normal(data["loc"], proposal, 1)
            rnd = random.rand(1)
            n_samples += 1

        data["face"] = requests.post('http://4.156.210.143:3000/generate', json={"data": sample.tolist()}).json()
        data["loc"] = sample.squeeze().tolist()
        return json.dumps(data), n_samples


class rateSource(Source):
    """A source that transmits facial expression."""

    __mapper_args__ = {"polymorphic_identity": "rate_source"}

    rec_names = [i for i in os.listdir("static/images/rec/") if i[-1] == "g"]
    fer_names = [i for i in os.listdir("static/images/fer/") if i[-1] == "g"]
    rpt_names = [i for i in os.listdir("static/images/repeat/") if i[-1] == "g"]

    def _what(self):
        """What to transmit by default."""
        data = {}
        idx = int(self.network.id) - 1

        if idx < 50:
            data["image"] = "static/images/rec/" + self.rec_names[idx]
            return rateInfo(origin=self, contents=json.dumps(data), details="rec_" + self.rec_names[idx])
        elif idx < 100:
            data["image"] = "static/images/fer/" + self.fer_names[idx-50]
            return rateInfo(origin=self, contents=json.dumps(data), details="fer_" + self.fer_names[idx-50])
        else:
            data["image"] = "static/images/repeat/" + self.rpt_names[idx-100]
            return rateInfo(origin=self, contents=json.dumps(data), details=self.rpt_names[idx-100])


class rateInfo(Info):
    """An Info that can be chosen."""

    __mapper_args__ = {"polymorphic_identity": "rate_info"}

    @hybrid_property
    def rating(self):
        """Use property1 to store whether an info was chosen."""
        try:
            return int(self.property1)
        except TypeError:
            return None

    @rating.setter
    def rating(self, rating):
        """Assign chosen to property1."""
        self.property1 = repr(rating)

    @rating.expression
    def rating(self):
        """Retrieve chosen via property1."""
        return cast(self.property1, int)

    @hybrid_property
    def choice(self):
        """Use property1 to store whether an info was chosen."""
        try:
            return str(self.property2)
        except TypeError:
            return None

    @choice.setter
    def choice(self, choice):
        """Assign chosen to property1."""
        self.property2 = repr(choice)

    @choice.expression
    def choice(self):
        """Retrieve chosen via property1."""
        return cast(self.property2, str)


class catchSource(Source):
    """A source that transmits facial expression."""

    __mapper_args__ = {"polymorphic_identity": "catch_source"}

    def _what(self):
        """What to transmit by default."""
        data = {}

        data["left"] = f"static/images/catcher/{self.network.role.split('_')[0]}/left.png"
        data["right"] = f"static/images/catcher/{self.network.role.split('_')[0]}/right.png"
        return FaceInfo(origin=self, contents=json.dumps(data))

class catchAgent(Agent):

    __mapper_args__ = {"polymorphic_identity": "catchAgent"}

    def __init__(self, network, participant, details): 
        super(catchAgent, self).__init__(network, participant)
        self.details = details

    def update(self, infos):
        info = json.loads(infos[0].contents)
        FaceInfo(origin=self, contents=json.dumps({"face": info["left"]}))
        FaceInfo(origin=self, contents=json.dumps({"face": info["right"]}))
# class Perturbation(Transformation):
#     """A perturbation is a transformation that perturbs the contents."""

#     __mapper_args__ = {"polymorphic_identity": "perturbation"}
