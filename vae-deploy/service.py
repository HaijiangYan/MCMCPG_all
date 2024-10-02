import numpy as np
import bentoml
from bentoml.io import JSON
import torch
import matplotlib.pyplot as plt
import io
import base64

vae_runner = bentoml.pytorch.get("vae_decoder:latest").to_runner()
svc = bentoml.Service("vae_decoder", runners=[vae_runner])

@svc.api(input=JSON(), output=JSON())
def generate(input_json) -> np.ndarray:
	input_data = np.array(input_json["data"])
	input_tensor = torch.from_numpy(input_data).float()
	result = vae_runner.run(input_tensor)
	result = result[0, 0, :, :] * 255

	buffered = io.BytesIO()
	plt.imsave(buffered, result.astype("uint8"), format='png', cmap='gray')
	image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

	return image_base64