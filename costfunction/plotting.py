import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau
from itertools import combinations

# Load data from CSV file
data = pd.read_csv('learningTasksets.csv')
raw = data[['N', 'U', 'P', 'L', 'giniC', 'giniT', 'giniD']].values
raw_without_giniD = data[['N', 'U', 'P', 'L', 'giniC', 'giniT']].values
raw2 = data[['N', 'P', 'giniC', 'giniT', 'giniD']].values
rawFirst = data[['N', 'U', 'P', 'L']].values
y = data['difficulty'].values
N = raw[:, 0]
U = raw[:, 1]
P = raw[:, 2]
L = raw[:, 3]
GC = raw[:, 4]
GT = raw[:, 5]
GD = raw[:, 6]
X = (N, U, P, L, GC, GT, GD)


def calculate_r2(y_true, y_pred):
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    return 1 - (ss_res / ss_tot) if ss_tot != 0 else np.nan


def calculate_kendall_tau(y_true, y_pred):
    return kendalltau(y_true, y_pred)


def calculate_fit_metrics(y_true, y_pred):
    r2 = calculate_r2(y_true, y_pred)
    tau, tau_pvalue = calculate_kendall_tau(y_true, y_pred)
    return {
        "r2": r2,
        "tau": tau,
        "tau_pvalue": tau_pvalue,
    }

def plotVariableDifficultyCorrelation():
    variables = [
        # ('N', N, 'Number of Tasks'),
        # ('U', U, 'Utilization'),
        # ('P', P, 'Avg Preemption'),
        # ('L', L, 'Avg Laxity'),
        ('giniC', GC, 'Gini Coefficient C'),
        ('giniT', GT, 'Gini Coefficient T'),
        # ('giniD', GD, 'Gini Coefficient D'),
    ]

    n_rows = 2
    n_cols = max(1, int(np.ceil(len(variables) / n_rows)))
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(6 * n_cols, 10))
    fig.suptitle('Parameter Correlation with Task Difficulty', fontsize=16, fontweight='bold')
    
    axes_flat = np.array(axes).reshape(-1)

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

        r2_linear = calculate_r2(y, y_pred_linear)
        r2_poly = calculate_r2(y, y_pred_poly)
        delta_r2 = r2_poly - r2_linear

        mae_linear = np.mean(np.abs(y - y_pred_linear))
        mae_poly = np.mean(np.abs(y - y_pred_poly))
        delta_mae = mae_poly - mae_linear

        # Compute Pearson and Kendall tau for raw x vs y
        correlation = np.corrcoef(var_data, y)[0, 1]
        tau, tau_pvalue = calculate_kendall_tau(var_data, y)

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

    for idx in range(len(variables), len(axes_flat)):
        fig.delaxes(axes_flat[idx])
    
    plt.tight_layout()
    plt.savefig('parameter_difficulty_correlation.png', dpi=150, bbox_inches='tight')
    print("\n Saved plot as 'parameter_difficulty_correlation.png'")
    plt.show()


def main():
    plotVariableDifficultyCorrelation()

if __name__ == "__main__":
    main()