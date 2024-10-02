import bentoml
import torch
import models
from resVAE import bentoVAE

model = torch.load("model_deploy/seed13_KL02(decoder).pt")

# Save model to the BentoML local Model Store
saved_model = bentoml.pytorch.save_model("vae_decoder", model)