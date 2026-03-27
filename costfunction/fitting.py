import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau

# Load data from CSV file
data = pd.read_csv('learningTasksets.csv')
raw = data[['N', 'U', 'P', 'L', 'giniC', 'giniT']].values
y = data['difficulty'].values
N = raw[:, 0]
U = raw[:, 1]
P = raw[:, 2]
L = raw[:, 3]
GC = raw[:, 4]
GT = raw[:, 5]
X = (N, U, P, L, GC, GT)


def linearFunction(X, a, b, c, d):
    N, U, P, L, GC, GT = X
    return a*N + b*U + c*P + d*L

def quadraticFunction(X, a, b, c, d, e, f, g, h, i, j):
    N, U, P, L, GC, GT = X
    return (a*N**2 + b*U**2 + c*P**2 + d*L**2 +
            e*N*U + f*N*P + g*N*L + h*U*P + i*U*L + j*P*L)

def testFunction(X, a, b, c, d):
    N, U, P, L, GC, GT = X

    return (N**a * (1 + P)**b * U**c ) / (L**d + 1)

def testfunction2(X, a, b, c, d, e):
    N, U, P, L, GC, GT = X

    return a*N * b*(1 + P) * c*U * d*L * e*((1+P)*U*N)

def testfunction3(X, a, b, c, d, e):
    N, U, P, L, GC, GT = X

    return a + b*N + c*U + d*P + e*(U*P*L)

# Try different approaches, starting with curve fitting for some functions I came up with
def curveFitting(function):
    print("\n Starting curve fitting using scipy's curve_fit")
    parameters, covariance = curve_fit(function, X, y)
    predictions = function(X, *parameters)

    ss_res = np.sum((y - predictions) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else np.nan
    tau, tau_pvalue = kendalltau(y, predictions)
    print(f" Completed fitting for {function.__name__}")

    return {
        "name": function.__name__,
        "parameters": parameters,
        "covariance": covariance,
        "r2": r_squared,
        "tau": tau,
        "tau_pvalue": tau_pvalue,
    }

    #print(f"\n Final function: {function.__name__}(N, U, P, L) = {parameters[0]:.4f}*N + {parameters[1]:.4f}*U + {parameters[2]:.4f}*P + {parameters[3]:.4f}*L")


def _format_formula(result):
    name = result["name"]
    p = result["parameters"]

    if name == "linearFunction":
        a, b, c, d = p
        return (
            "```math\n"
            f"f(N,U,P,L)={a:.8f}N{b:+.8f}U{c:+.8f}P{d:+.8f}L\n"
            "```"
        )

    if name == "quadraticFunction":
        a, b, c, d, e, f, g, h, i, j = p
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,U,P,L)=&{a:.8f}N^2{b:+.8f}U^2{c:+.8f}P^2{d:+.8f}L^2\\\\\n"
            f"&{e:+.8f}NU{f:+.8f}NP{g:+.8f}NL\\\\\n"
            f"&{h:+.8f}UP{i:+.8f}UL{j:+.8f}PL\n"
            "\\end{aligned}\n"
            "```"
        )

    if name == "testfunction2":
        a, b, c, d, e = p
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,U,P,L)=&({a:.8f}\\cdot N)\\cdot({b:.8f}\\cdot(1+P))\\\\\n"
            f"&\\cdot({c:.8f}\\cdot U)\\cdot({d:.8f}\\cdot L)\\\\\n"
            f"&\\cdot({e:.8f}\\cdot(1+P)\\cdot U\\cdot N)\n"
            "\\end{aligned}\n"
            "```"
        )

    if name == "testfunction3":
        a, b, c, d, e = p
        return (
            "```math\n"
            f"f(N,U,P,L)={a:.8f}{b:+.8f}N{c:+.8f}U{d:+.8f}P{e:+.8f}(UPL)\n"
            "```"
        )

    return f"```math\n{name}(...)\n```"


def create_markdown_text(results):
    lines = ["## Fitted Function Results", ""]

    for result in results:
        name = result["name"]
        lines.append(f"### {name}")
        lines.append("")
        lines.append(f"R^2 Score: {result['r2']:.4f}")
        lines.append("")
        lines.append(
            f"Kendall tau: {result['tau']:.4f} (p={result['tau_pvalue']:.4g})"
        )
        lines.append("")
        lines.append(_format_formula(result))
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"



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
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle('Parameter Correlation with Task Difficulty', fontsize=16, fontweight='bold')
    
    variables = [
        ('N', N, 'Number of Tasks'),
        ('U', U, 'Utilization'),
        ('P', P, 'Avg Preemption'),
        ('L', L, 'Avg Laxity'),
        ('giniC', GC, 'Gini Coefficient C'),
        ('giniT', GT, 'Gini Coefficient T')
    ]
    
    axes_flat = axes.flatten()

    print("\n Linear vs Polynomial (2nd order) fit summary per parameter:")
    
    for idx, (var_name, var_data, var_label) in enumerate(variables):
        ax = axes_flat[idx]
        
        ax.scatter(var_data, y, alpha=0.6, s=80, color='steelblue', edgecolors='black', linewidth=0.5)
        
        # Linear fit: y = m*x + b
        linear_coeffs = np.polyfit(var_data, y, 1)
        linear_fn = np.poly1d(linear_coeffs)

        # Polynomial fit (order 2): y = a*x^2 + b*x + c
        poly_coeffs = np.polyfit(var_data, y, 2)
        poly_fn = np.poly1d(poly_coeffs)

        x_trend = np.linspace(var_data.min(), var_data.max(), 100)

        y_pred_linear = linear_fn(var_data)
        y_pred_poly = poly_fn(var_data)

        ss_res_linear = np.sum((y - y_pred_linear) ** 2)
        ss_res_poly = np.sum((y - y_pred_poly) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r2_linear = 1 - (ss_res_linear / ss_tot) if ss_tot != 0 else np.nan
        r2_poly = 1 - (ss_res_poly / ss_tot) if ss_tot != 0 else np.nan
        delta_r2 = r2_poly - r2_linear

        mae_linear = np.mean(np.abs(y - y_pred_linear))
        mae_poly = np.mean(np.abs(y - y_pred_poly))
        delta_mae = mae_poly - mae_linear

        # Compute Pearson and Kendall tau for raw x vs y
        correlation = np.corrcoef(var_data, y)[0, 1]
        tau, tau_pvalue = kendalltau(var_data, y)

        ax.plot(
            x_trend,
            linear_fn(x_trend),
            color='orange',
            linestyle='-',
            linewidth=1.8,
            label=f'Linear: Pearson={correlation:.3f}, Tau={tau:.3f}, R²={r2_linear:.3f}',
            alpha=0.9,
        )

        ax.plot(
            x_trend,
            poly_fn(x_trend),
            'r--',
            linewidth=2,
            label=f'Polynomial 2nd order: Pearson={correlation:.3f}, Tau={tau:.3f}, R²={r2_poly:.3f}',
            alpha=0.8,
        )
        
        print(
            f"{var_name}: Pearson={correlation:.4f}, Tau={tau:.4f} (p={tau_pvalue:.4g}) | "
            f"Linear R²={r2_linear:.4f} vs Polynomial 2nd order R²={r2_poly:.4f} | ΔR²={delta_r2:+.4f}"
        )
        
        ax.set_xlabel('', fontsize=11, fontweight='bold')
        ax.set_ylabel('Difficulty', fontsize=11, fontweight='bold')
        ax.set_title(f'{var_name} vs Difficulty', fontsize=12, fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.legend(fontsize=8, loc='best')
    
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
    #functionFitting()
    fitting_results = []

    print("\n ======= Linear ========")
    fitting_results.append(curveFitting(linearFunction))
    print("\n ======= Quadratic ========")
    fitting_results.append(curveFitting(quadraticFunction))
    print("\n ======= Test Function 2========")
    fitting_results.append(curveFitting(testfunction2))
    print("\n ======= Test Function 3========")
    fitting_results.append(curveFitting(testfunction3))

    markdown_text = create_markdown_text(fitting_results)
    print("\n ======= Markdown Text =======")
    print(markdown_text)

    plotVariableDifficultyCorrelation()
    calculateParameterSpaceDistance()

if __name__ == "__main__":
    main()