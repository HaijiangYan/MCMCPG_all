import numpy as np
import matplotlib.pyplot as plt 
import torch
from mpl_toolkits.axes_grid1 import ImageGrid
import arviz as az
import copy

def KLdivergence(x, y):
    
    from scipy.spatial import cKDTree as KDTree

  # Check the dimensions are consistent
    x = np.atleast_2d(x)
    y = np.atleast_2d(y)

    n,d = x.shape
    m,dy = y.shape

    assert(d == dy)


    # Build a KD tree representation of the samples and find the nearest neighbour
    # of each point in x.
    xtree = KDTree(x)
    ytree = KDTree(y)
    
    # Get the first two nearest neighbours for x, since the closest one is the
    # sample itself.
    r = xtree.query(x, k=2, eps=.01, p=2)[0][:,1]
    s = ytree.query(x, k=1, eps=.01, p=2)[0]
    
    # There is a mistake in the paper. In Eq. 14, the right side misses a negative sign
    # on the first term of the right hand side.
    return -np.log(r/s).sum() * d / n + np.log(m / (n - 1.))

def galmen_rubin(chain1, chain2, method="identity"):
    # Ensure the chains are the same length
    if len(chain1) != len(chain2):
        min_len = min(len(chain1), len(chain2))
        chain1 = chain1[:min_len]
        chain2 = chain2[:min_len]
    chains = np.stack((chain1, chain2), axis=0)
    chains = az.convert_to_dataset(chains)
    R_hat = np.max(az.rhat(chains, method=method).x.values)
    return R_hat

def pca_recface(pca, scaler, data, mode='single', index=1):
    if mode == 'single':
        reconstructed_face = scaler.inverse_transform(pca.inverse_transform(
            np.array(data[index]).reshape(-1, 157))).reshape((64, 40))
    elif mode == 'cumulative':
        cumulative_mean = np.mean(data[:index], axis=0)
        reconstructed_face = scaler.inverse_transform(pca.inverse_transform(
            np.array(cumulative_mean).reshape(-1, 157))).reshape((64, 40))
    return reconstructed_face

def pca_serialface(pca, scaler, data, mode, serie):
    fig = plt.figure(figsize=(5., 20.))
    grid = ImageGrid(fig, 111, nrows_ncols=(1, len(serie)), axes_pad=0.0)
    for idx, (ax, im) in enumerate(zip(grid, [pca_recface(pca, scaler, data, mode=mode, index=i) for i in serie])):
        ax.imshow(im, cmap='gray')
        ax.set_title(f"{serie[idx]}")
        ax.axis('off')
    plt.show()

def vae_recface(model, data, mode='single', index=1):
    input_tensor = torch.tensor(data).float()
    if mode == 'single':
        result = model(input_tensor[index])
    elif mode == 'cumulative':
        cumulative_mean = torch.mean(input_tensor[:index], axis=0)
        result = model(cumulative_mean)
    reconstructed_face = result[0, 0, :, :] * 255
    return reconstructed_face

def draw_choice(array_1, array_2, title, label, plot_range=[-6, 6]):
    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(projection='3d', computed_zorder=False)
    array_1, array_2 = np.array(array_1), np.array(array_2)
    # ax.scatter(array[:, 0], array[:, 1], array[:, 2],
    #            c=array[:, 3], alpha=0.5, cmap='turbo')
    ax.scatter(array_1[0, 0], array_1[0, 1], array_1[0, 2], c='r', label="Initial states", zorder=10)
    ax.scatter(array_2[0, 0], array_2[0, 1], array_2[0, 2], c='r', zorder=10)
    # ax.scatter(center[0], center[1], center[2], c='black', marker='*', label="Center of VAE's knowledge")

    ax.plot(array_1[:, 0], array_1[:, 1], array_1[:, 2], label='Trace of Markov Chain #1', alpha=0.4) 
    ax.plot(array_2[:, 0], array_2[:, 1], array_2[:, 2], label='Trace of Markov Chain #2', alpha=0.4)
    
    uv_1 = [0]  # unique values
    uv_2 = [0]
    size_1 = np.zeros((len(array_1), 1))
    size_2 = np.zeros((len(array_2), 1))
    for i in range(len(size_1)):
        size_1[i, 0] = np.sum(array_1[:, 0]==array_1[i, 0])
        if i > 0 and size_1[i, 0] != size_1[i-1, 0]:
            uv_1.append(i)
            
    for i in range(len(size_2)):
        size_2[i, 0] = np.sum(array_2[:, 0]==array_2[i, 0])
        if i > 0 and size_2[i, 0] != size_2[i-1, 0]:
            uv_2.append(i)
    
    ax.scatter(array_1[uv_1, 0], array_1[uv_1, 1], array_1[uv_1, 2], s=size_1[uv_1, 0].astype(float) * 4.5, label='Samples in Markov Chain #1', alpha=0.4)
    ax.scatter(array_2[uv_2, 0], array_2[uv_2, 1], array_2[uv_2, 2], s=size_2[uv_2, 0].astype(float) * 4.5, label='Samples in Markov Chain #2', alpha=0.4)
    
    ax.set_xlim(plot_range[0], plot_range[1])
    ax.set_ylim(plot_range[0], plot_range[1])
    ax.set_zlim(plot_range[0], plot_range[1])
    
    ax.set_xlabel("X", fontsize=17)
    ax.set_ylabel("Y", fontsize=17)
    ax.set_zlabel("Z", fontsize=17)
    ax.tick_params(axis='both', which='major', labelsize=13)
    
    plt.title(title)
    plt.tight_layout()
    
    if label == 'on':
        ax.legend(fontsize=13)
    # plt.savefig('./figure/save.jpg')
    plt.show()

class EarlyStopper:
    def __init__(self, patience=1, min_delta=0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.max_validation_acc = 0
        self.max_model = None

    def early_stop(self, validation_acc, model):
        if validation_acc > self.max_validation_acc:
            self.max_validation_acc = validation_acc
            self.counter = 0
            self.max_model = copy.deepcopy(model)
        elif validation_acc <= self.max_validation_acc:
            self.counter += 1
            if self.counter >= self.patience:
                return True
        return False
