import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit

# Load data from CSV file
data = pd.read_csv('learningTasksets.csv')
raw = data[['N', 'U', 'P', 'L']].values
y = data['difficulty'].values
N = raw[:, 0]
U = raw[:, 1]
P = raw[:, 2]
L = raw[:, 3]
X = (N, U, P, L)


def linearFunction(X, a, b, c, d):
    N, U, P, L = X
    print(N, U, P, L)
    return a*N + b*U + c*P + d*L

def quadraticFunction(X, a, b, c, d, e, f, g, h, i, j):
    N, U, P, L = X
    return (a*N**2 + b*U**2 + c*P**2 + d*L**2 +
            e*N*U + f*N*P + g*N*L + h*U*P + i*U*L + j*P*L)

def testFunction(X, a, b, c, d):
    N, U, P, L = X

    return (N**a * (1 + P)**b * U**c ) / (L**d + 1)

def testfunction2(X, a, b, c, d, e):
    N, U, P, L = X

    return a*N * b*(1 + P) * c*U * d*L * e*((1+P)*U*N)

def testfunction3(X, a, b, c, d, e):
    N, U, P, L = X

    return a + b*N + c*U + d*P + e*(U*P*L)

# Try different approaches, starting with curve fitting for some functions I came up with
def curveFitting(function):
    print("\n Starting curve fitting using scipy's curve_fit")
    parameters, covariance = curve_fit(function, X, y)
    print("\n Function Parameters:")
    print(parameters)
    print("\n Covariance Matrix:")
    print(covariance)

    #print(f"\n Final function: {function.__name__}(N, U, P, L) = {parameters[0]:.4f}*N + {parameters[1]:.4f}*U + {parameters[2]:.4f}*P + {parameters[3]:.4f}*L")



# Using PySR lib using Julia to find the best fitting function for the data
def functionFitting():
    print("\n Starting symbolic regression with PySR")
    model = PySRRegressor(
        niterations=100,                    
        population_size=30,                
        binary_operators=["+", "*"],
        unary_operators=[],
        complexity_of_variables=1,
        verbosity=1,
        random_state=42,
    )
    print("\n Now training the model")
    model.fit(raw, y)
    print("\n Done training the model, now evaluating results")
    print("\n Best fitting Fnuction:")
    print(model.sympy())
    print(f"\nR² Score: {model.score(raw, y):.4f}")

    print("\n Plotting results vs predictions")
    predictions = model.predict(raw)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))


    axes[0].scatter(y, predictions, alpha=0.6, s=50)
    axes[0].plot([y.min(), y.max()], [y.min(), y.max()], 'r--', label='Perfect Fit')
    axes[0].set_xlabel('Actual Difficulty')
    axes[0].set_ylabel('Predicted Difficulty')
    axes[0].set_title(f'Fit Quality (R² = {model.score(raw, y):.3f})')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)


    residuals = y - predictions
    axes[1].scatter(predictions, residuals, alpha=0.6, s=50)
    axes[1].axhline(y=0, color='r', linestyle='--')
    axes[1].set_xlabel('Predicted Difficulty')
    axes[1].set_ylabel('Residual')
    axes[1].set_title('Residuals')
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('pysr_results.png', dpi=150)
    plt.show()

    print("\n Saved plot as'pysr_results.png'")

    print("\n Show all models found")
    print(model.equations)





def plotVariableDifficultyCorrelation():
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Parameter Correlation with Task Difficulty', fontsize=16, fontweight='bold')
    
    variables = [
        ('N', N, 'Number of Tasks'),
        ('U', U, 'Utilization'),
        ('P', P, 'Avg Preemption'),
        ('L', L, 'Avg Laxity')
    ]
    
    axes_flat = axes.flatten()
    
    for idx, (var_name, var_data, var_label) in enumerate(variables):
        ax = axes_flat[idx]
        
        ax.scatter(var_data, y, alpha=0.6, s=80, color='steelblue', edgecolors='black', linewidth=0.5)
        
        # Try polynomial
        z = np.polyfit(var_data, y, 2)
        p = np.poly1d(z)
        x_trend = np.linspace(var_data.min(), var_data.max(), 100)
        ax.plot(x_trend, p(x_trend), 'r--', linewidth=2, label='Polynomial Fit (order 2)', alpha=0.8)
        
        correlation = np.corrcoef(var_data, y)[0, 1]
        
        ax.set_xlabel(f'{var_name}: {var_label}', fontsize=11, fontweight='bold')
        ax.set_ylabel('Difficulty', fontsize=11, fontweight='bold')
        ax.set_title(f'{var_name} vs Difficulty (Correlation: {correlation:.3f})', fontsize=12)
        ax.grid(True, alpha=0.3)
        ax.legend(fontsize=9)
    
    plt.tight_layout()
    plt.savefig('parameter_difficulty_correlation.png', dpi=150, bbox_inches='tight')
    print("\n Saved plot as 'parameter_difficulty_correlation.png'")
    plt.show()


def calculateParameterSpaceDistance():

    print("\n Calculating Parameter Space Distances")
    n_tasksets = len(raw)
    distance_matrix = np.full((n_tasksets, n_tasksets), np.nan)
    
    for i in range(n_tasksets):
        for j in range(i, n_tasksets):
            # Euclidean distance: sqrt((N1-N2)^2 + (U1-U2)^2 + (P1-P2)^2 + (L1-L2)^2)
            distance = np.sqrt(np.sum((raw[i] - raw[j])**2))
            distance_matrix[i, j] = distance
    
    fig, ax = plt.subplots(figsize=(12, 10))
    

    masked_matrix = np.ma.masked_where(np.tril(np.ones_like(distance_matrix), k=-1).astype(bool), distance_matrix)
    
    im = ax.imshow(masked_matrix, cmap='coolwarm', aspect='auto')
    
    taskset_ids = [f'ts_{i+1}\n(d:{int(y[i])})' for i in range(n_tasksets)]
    ax.set_xticks(range(n_tasksets))
    ax.set_yticks(range(n_tasksets))
    ax.set_xticklabels(taskset_ids, rotation=45, ha='right')
    ax.set_yticklabels(taskset_ids)
    
    ax.set_xlabel('Taskset', fontsize=12, fontweight='bold')
    ax.set_ylabel('Taskset', fontsize=12, fontweight='bold')
    ax.set_title('Parameter Space Euclidean Distance', fontsize=14, fontweight='bold')
    
    cbar = plt.colorbar(im, ax=ax)
    cbar.set_label('Distance', rotation=270, labelpad=20)
    
    for i in range(n_tasksets):
        for j in range(i, n_tasksets):
            text = ax.text(j, i, f'{distance_matrix[i, j]:.2f}',
                          ha="center", va="center", color="w", fontsize=8)
    
    plt.tight_layout()
    plt.savefig('parameter_distance_map.png', dpi=150, bbox_inches='tight')
    print("\n Saved distance matrix as 'parameter_distance_map.png'")
    plt.show()
    
    # Print statistics
    upper_triangle = distance_matrix[np.triu_indices(n_tasksets, k=1)]
    print("\n Distance Matrix Statistics:")
    print(f"Min distance: {np.nanmin(upper_triangle):.4f}")
    print(f"Max distance: {np.nanmax(upper_triangle):.4f}")
    print(f"Mean distance: {np.nanmean(upper_triangle):.4f}")
    
    return distance_matrix


def main():
    functionFitting()
    print("\n ======= Linear ========")
    curveFitting(linearFunction)
    print("\n ======= Quadratic ========")
    curveFitting(quadraticFunction)
    print("\n ======= Test Function 2========")
    curveFitting(testfunction2)
    print("\n ======= Test Function 3========")
    curveFitting(testfunction3)
    plotVariableDifficultyCorrelation()
    calculateParameterSpaceDistance()

if __name__ == "__main__":
    main()