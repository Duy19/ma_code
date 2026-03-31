import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau

# Load data from CSV file
data = pd.read_csv('learningTasksets.csv')
raw = data[['N', 'U', 'P', 'L', 'giniC', 'giniT']].values
raw2 = data[['N', 'P', 'giniC', 'giniT']].values
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
    # return a*N + b*U + c*P + d*L
    return a*N + b*GC + c*P + d*GT

def quadraticFunction(X, b0, b1, b2, b3, b4, q1, q2, q3, q4, i1, i2, i3, i4, i5, i6):
    N, U, P, L, GC, GT = X
    return (
        b0
        + b1*N + b2*P + b3*GC + b4*GT
        + q1*N**2 + q2*P**2 + q3*GC**2 + q4*GT**2
        + i1*N*P + i2*N*GC + i3*N*GT + i4*P*GC + i5*P*GT + i6*GC*GT
    )

def testFunction(X, a, b, c, d):
    N, U, P, L, GC, GT = X
    # return (N**a * (1 + P)**b * U**c ) / (L**d + 1)
    return (N**a * (1 + P)**b * GC**c ) / (GT**d + 1)

def testfunction2(X, a, b, c, d, e):
    N, U, P, L, GC, GT = X
    # return a*N * b*(1 + P) * c*U * d*L * e*((1+P)*U*N)
    return a*N * b*(1 + P) * c*GC * d*GT * e*((1+P)*GC*N)

def testfunction3(X, a, b, c, d, e):
    N, U, P, L, GC, GT = X
    # return a + b*N + c*U + d*P + e*(U*P*L)
    return a + b*N + c*GC + d*P + e*(GC*P*GT)

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
            f"f(N,giniC,P,giniT)={a:.8f}N{b:+.8f}giniC{c:+.8f}P{d:+.8f}giniT\n"
            "```"
        )

    if name == "quadraticFunction":
        b0, b1, b2, b3, b4, q1, q2, q3, q4, i1, i2, i3, i4, i5, i6 = p
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,giniC,P,giniT)=&{b0:.8f}{b1:+.8f}N{b2:+.8f}P{b3:+.8f}giniC{b4:+.8f}giniT\\\\\n"
            f"&{q1:+.8f}N^2{q2:+.8f}P^2{q3:+.8f}giniC^2{q4:+.8f}giniT^2\\\\\n"
            f"&{i1:+.8f}NP{i2:+.8f}N\,giniC{i3:+.8f}N\,giniT\\\\\n"
            f"&{i4:+.8f}P\,giniC{i5:+.8f}P\,giniT{i6:+.8f}giniC\,giniT\n"
            "\\end{aligned}\n"
            "```"
        )

    if name == "testfunction2":
        a, b, c, d, e = p
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,giniC,P,giniT)=&({a:.8f}\\cdot N)\\cdot({b:.8f}\\cdot(1+P))\\\\\n"
            f"&\\cdot({c:.8f}\\cdot giniC)\\cdot({d:.8f}\\cdot giniT)\\\\\n"
            f"&\\cdot({e:.8f}\\cdot(1+P)\\cdot giniC\\cdot N)\n"
            "\\end{aligned}\n"
            "```"
        )

    if name == "testfunction3":
        a, b, c, d, e = p
        return (
            "```math\n"
            f"f(N,giniC,P,giniT)={a:.8f}{b:+.8f}N{c:+.8f}giniC{d:+.8f}P{e:+.8f}(giniC\\cdot P\\cdot giniT)\n"
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
    model.fit(raw2, y)
    print("\n Done training the model, now evaluating results")
    print("\n Best fitting Fnuction:")
    print(model.sympy())
    print(f"\nR² Score: {model.score(raw2, y):.4f}")

    print("\n Plotting results vs predictions")
    predictions = model.predict(raw2)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))


    axes[0].scatter(y, predictions, alpha=0.6, s=50)
    axes[0].plot([y.min(), y.max()], [y.min(), y.max()], 'r--', label='Perfect Fit')
    axes[0].set_xlabel('Actual Difficulty')
    axes[0].set_ylabel('Predicted Difficulty')
    axes[0].set_title(f'Fit Quality (R² = {model.score(raw2, y):.3f})')
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


def calculateCostFunctionDistancePerTaskset(linear_result, quadratic_result):
    print("\n Calculating linear vs quadratic distance per taskset")

    y_linear = linearFunction(X, *linear_result["parameters"])
    y_quadratic = quadraticFunction(X, *quadratic_result["parameters"])
    diff_data = y_quadratic - y_linear

    mae = np.mean(np.abs(diff_data))
    rmse = np.sqrt(np.mean(diff_data ** 2))
    max_abs = np.max(np.abs(diff_data))
    tau, tau_pvalue = kendalltau(y_linear, y_quadratic)

    print("\n Function distance metrics on observed tasksets:")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"Max |Δ|: {max_abs:.4f}")
    print(f"Kendall tau (linear vs quadratic): {tau:.4f} (p={tau_pvalue:.4g})")

    taskset_idx = np.arange(1, len(y_linear) + 1)

    fig, ax = plt.subplots(figsize=(15, 7))

    ax.plot(taskset_idx, y_linear, marker='o', linewidth=2, color='royalblue', label='Linear')
    ax.plot(taskset_idx, y_quadratic, marker='s', linewidth=2, color='firebrick', label='Quadratic')

    for i in range(len(taskset_idx)):
        ax.vlines(
            taskset_idx[i],
            y_linear[i],
            y_quadratic[i],
            color='gray',
            alpha=0.55,
            linewidth=1.3,
        )

    ax.set_xlabel('Taskset')
    ax.set_ylabel('Predicted Difficulty')
    ax.set_title('Linear vs Quadratic per Taskset (vertical distance = |Δ|)')
    ax.set_xticks(taskset_idx)
    ax.grid(True, alpha=0.3)
    ax.legend()

    text = (
        f"MAE={mae:.3f} | RMSE={rmse:.3f} | Max|Δ|={max_abs:.3f} | "
        f"Tau={tau:.3f}"
    )
    ax.text(
        0.01,
        0.99,
        text,
        transform=ax.transAxes,
        ha='left',
        va='top',
        bbox=dict(boxstyle='round,pad=0.35', facecolor='white', alpha=0.9, edgecolor='gray'),
    )

    plt.tight_layout()
    plt.savefig('costfunction_distance_per_taskset.png', dpi=150, bbox_inches='tight')
    print("\n Saved plot as 'costfunction_distance_per_taskset.png'")
    plt.show()

    return {
        "tasksets": {
            "mae": mae,
            "rmse": rmse,
            "max_abs": max_abs,
            "tau": tau,
            "tau_pvalue": tau_pvalue,
        }
    }


def main():
    functionFitting()
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

    result_by_name = {result["name"]: result for result in fitting_results}
    calculateCostFunctionDistancePerTaskset(
        result_by_name["linearFunction"],
        result_by_name["quadraticFunction"],
    )

    plotVariableDifficultyCorrelation()

if __name__ == "__main__":
    main()