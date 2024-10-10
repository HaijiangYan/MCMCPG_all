import torch

class bentoVAE(torch.nn.Module):
    def __init__(self, model):
        super(bentoVAE, self).__init__()
        self.model = model
 
    def forward(self, x):
        result = self.model(x)
        
        return result.detach().numpy()
