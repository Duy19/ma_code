import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau
from itertools import combinations
from pathlib import Path


# Load data from CSV file
data = pd.read_csv('testTasksets.csv')
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


def linear_weighted_costfunction(N, P, giniC, giniT, giniD):
	"""Linear weighted cost function (R^2=0.8539, tau=0.8068)."""
	return (
		0.303 * N
		+ 1.464 * P
		+ 5.587 * giniC
		+ 3.910 * giniT
		- 5.413 * giniD
	)


def linear_weighted_costfunction_nupl(N, U, P, L):
	"""Linear weighted N/U/P/L function (R^2=0.8191, tau=0.8160)."""
	return 0.443 * N - 0.497 * U + 4.006 * P + 0.072 * L


def quadratic_weighted_costfunction_nupl(N, U, P, L):
	"""Quadratic weighted N/U/P/L function (R^2=0.9527, tau=0.8920)."""
	return (
		2.585
		+ 1.335 * N
		- 10.955 * U
		+ 1.306 * P
		- 0.188 * L
		- 0.093 * (N ** 2)
		+ 8.693 * (U ** 2)
		- 1.334 * (P ** 2)
		- 0.003 * (L ** 2)
		- 0.747 * N * U
		+ 1.704 * N * P
		- 0.014 * N * L
		- 5.140 * U * P
		+ 0.464 * U * L
		+ 0.360 * P * L
	)


def pysr_nupl_f1(N, U, P, L):
	"""pySR N/U/P/L function 1 (R^2=0.9304, tau=0.8768)."""
	return N * (P + 0.425) - ((N - L) / (-17.280 + (19.700 / U)))


def pysr_nupl_f2(N, U, P, L):
	"""pySR N/U/P/L function 2 (R^2=0.9253, tau=0.8666)."""
	return N * P + U * L * (0.539 - 0.020 * L)


def pysr_nupl_f5(N, U, P, L):
	"""pySR N/U/P/L function 5 (R^2=0.9247, tau=0.8768)."""
	return N * P + (U / (0.135 + (1.641 / L)))


def quadratic_weighted_costfunction(N, P, giniC, giniT, giniD):
	"""Quadratic weighted cost function (R^2=0.9762, tau=0.9032)."""
	return (
		-0.747
		+ 1.144 * N
		- 5.754 * P
		- 7.894 * giniC
		+ 134.083 * giniT
		- 118.577 * giniD
		- 0.148 * (N ** 2)
		- 8.170 * (P ** 2)
		- 122.071 * (giniC ** 2)
		+ 284.182 * (giniT ** 2)
		+ 373.768 * (giniD ** 2)
		+ 1.226 * N * P
		+ 11.415 * N * giniC
		- 17.695 * N * giniT
		+ 5.423 * N * giniD
		+ 107.336 * P * giniC
		+ 22.030 * P * giniT
		- 112.267 * P * giniD
		- 129.930 * giniC * giniT
		+ 184.908 * giniC * giniD
		- 596.101 * giniT * giniD
	)


def pysr_best_costfunction(N, P, giniC, giniT, giniD):
	"""Best pySR-discovered cost function. (R^2 = 0.9213, tau = 0.8574)"""
	return giniC * (9.996 - (19.724 / N)) + np.exp(P)


def linear_weighted_costfunction_all_features(N, U, P, L, giniC, giniT, giniD):
	"""Linear weighted cost function with all features (R^2=0.8577, tau=0.8058)."""
	return (
		0.348 * N
		- 0.318 * U
		+ 1.786 * P
		+ 0.030 * L
		+ 3.750 * giniC
		+ 4.378 * giniT
		- 4.337 * giniD
	)


def pysr_all_features1(N, U, P, L, giniC, giniT, giniD):
	"""pySR function 1 (R^2=0.9619, tau=0.8829)."""
	return U * L * giniT + (N - 2.024) * (P - 0.505) + 3.988 - (6.275 / N)


def pysr_all_features2(N, U, P, L, giniC, giniT, giniD):
	"""pySR function 2 (R^2=0.9492, tau=0.8931)."""
	return giniT * (10.252 - (20.478 / N)) + np.exp(0.299 * L * P)


def interaction_exp_ginit_costfunction(N, P, L, giniT):
	"""Interaction + exponential model (R^2=0.8650, tau=0.8574)."""
	return 0.809 * N * P + 0.449 * np.exp(0.419 * L * P) + 1.008 * (1 - ((giniT - 0.5) ** 2))


def reduced_quadratic_ginic_costfunction(N, P, giniC):
	"""Reduced quadratic model using N, P, and transformed giniC."""
	return (
		780.169
		+ 1.259 * N
		- 3.113 * P
		- 0.151 * (N ** 2)
		- 0.840 * (P ** 2)
		+ 1.363 * N * P
		- 0.004 * ((giniC - 448.659) ** 2)
	)


def _write_test_markdown(results, output_path='testFunctions.md'):
	lines = ['## Test Function Evaluation', '']
	lines.append('| Function | Fitted R^2 with learning Tasksets | Fitted Kendall Tau with learning Tasksets | R^2 with test Tasksets | Kendall Tau with test Tasksets | Tau p-value with test Tasksets |')
	lines.append('|---|---:|---:|---:|---:|---:|')

	for entry in results:
		lines.append(
			f"| {entry['name']} | {entry['fitted_r2']:.4f} | {entry['fitted_tau']:.4f} | "
			f"{entry['test_r2']:.4f} | {entry['test_tau']:.4f} | {entry['test_tau_pvalue']:.4g} |"
		)

	lines.extend(['', '### Predictions per Taskset', ''])

	for entry in results:
		lines.append(f"#### {entry['name']}")
		lines.append('')
		lines.append(
			f"Fitted: R^2={entry['fitted_r2']:.4f}, tau={entry['fitted_tau']:.4f}  "
			f"| Tested: R^2={entry['test_r2']:.4f}, tau={entry['test_tau']:.4f}"
		)
		lines.append('')
		lines.append('| taskset_id | predicted_difficulty | actual_difficulty |')
		lines.append('|---|---:|---:|')
		for row in entry['rows']:
			lines.append(f"| {row[0]} | {row[1]:.6f} | {row[2]:.6f} |")
		lines.append('')

	Path(output_path).write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')


def testFunctions():
	taskset_ids = data['taskset_id'].values
	actual_difficulty = data['difficulty'].values

	pred_linear_weighted_costfunction_nupl = linear_weighted_costfunction_nupl(N, U, P, L)
	pred_quadratic_weighted_costfunction_nupl = quadratic_weighted_costfunction_nupl(N, U, P, L)
	pred_pysr_nupl_f1 = pysr_nupl_f1(N, U, P, L)
	pred_pysr_nupl_f2 = pysr_nupl_f2(N, U, P, L)
	pred_pysr_nupl_f5 = pysr_nupl_f5(N, U, P, L)

	pred_linear_weighted_costfunction = linear_weighted_costfunction(N, P, GC, GT, GD)
	pred_quadratic_weighted_costfunction = quadratic_weighted_costfunction(N, P, GC, GT, GD)
	pred_pysr_best_costfunction = pysr_best_costfunction(N, P, GC, GT, GD)
	pred_linear_weighted_costfunction_all_features = linear_weighted_costfunction_all_features(N, U, P, L, GC, GT, GD)
	pred_pysr_all_features1 = pysr_all_features1(N, U, P, L, GC, GT, GD)
	pred_pysr_all_features2 = pysr_all_features2(N, U, P, L, GC, GT, GD)
	pred_interaction_exp_ginit_costfunction = interaction_exp_ginit_costfunction(N, P, L, GT)
	pred_reduced_quadratic_ginic_costfunction = reduced_quadratic_ginic_costfunction(N, P, GC)

	functions_to_test = [
		('linear_weighted_costfunction_nupl', pred_linear_weighted_costfunction_nupl, 0.8191, 0.8160),
		('quadratic_weighted_costfunction_nupl', pred_quadratic_weighted_costfunction_nupl, 0.9527, 0.8920),
		('pysr_nupl_f1', pred_pysr_nupl_f1, 0.9304, 0.8768),
		('pysr_nupl_f2', pred_pysr_nupl_f2, 0.9253, 0.8666),
		('pysr_nupl_f5', pred_pysr_nupl_f5, 0.9247, 0.8768),
		('linear_weighted_costfunction', pred_linear_weighted_costfunction, 0.8539, 0.8068),
		('quadratic_weighted_costfunction', pred_quadratic_weighted_costfunction, 0.9762, 0.9032),
		('pysr_best_costfunction', pred_pysr_best_costfunction, 0.9213, 0.8574),
		('linear_weighted_costfunction_all_features', pred_linear_weighted_costfunction_all_features, 0.8577, 0.8058),
		('pysr_all_features1', pred_pysr_all_features1, 0.9619, 0.8829),
		('pysr_all_features2', pred_pysr_all_features2, 0.9492, 0.8931),
		('reduced_quadratic_ginic_costfunction', pred_reduced_quadratic_ginic_costfunction, 0.9280, 0.8575),
		('interaction_exp_ginit_costfunction', pred_interaction_exp_ginit_costfunction, 0.8650, 0.8574),
	]

	results_for_markdown = []

	for function_entry in functions_to_test:
		function_name = function_entry[0]
		predicted_difficulty = np.asarray(function_entry[1])
		fitted_r2 = function_entry[2]
		fitted_tau = function_entry[3]
		metrics = calculate_fit_metrics(actual_difficulty, predicted_difficulty)

		print(
			f"{function_name} "
			f"(fitted r^2={fitted_r2:.4f}, fitted tau={fitted_tau:.4f}, "
			f"test r^2={metrics['r2']:.4f}, test tau={metrics['tau']:.4f}):"
		)
		print('TasksetID, predicted difficulty, actual difficulty')

		for taskset_id, predicted, actual in zip(taskset_ids, predicted_difficulty, actual_difficulty):
			print(f"{taskset_id}, {predicted:.6f}, {actual:.6f}")

		print()

		results_for_markdown.append(
			{
				'name': function_name,
				'fitted_r2': fitted_r2,
				'fitted_tau': fitted_tau,
				'test_r2': metrics['r2'],
				'test_tau': metrics['tau'],
				'test_tau_pvalue': metrics['tau_pvalue'],
				'rows': list(zip(taskset_ids, predicted_difficulty, actual_difficulty)),
			}
		)

	_write_test_markdown(results_for_markdown)
	print('Wrote markdown summary to testFunctions.md')


if __name__ == '__main__':
	testFunctions()



