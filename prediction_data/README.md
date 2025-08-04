# Prediction Data Structure

This directory contains the prediction data for the AEGIS symbol prediction system.

## Directory Structure

```
prediction_data/
├── training/          # Training data (provided by course website/comp website)
│   ├── x_train_symbols.npy
│   └── y_train_symbols.npy
├── testing/           # Student testing data (provided by course website/comp website)
│   ├── x_test_symbols.npy
│   └── y_test_symbols.npy
└── testing-marking/   # Marking testing data (not given publicly)
    ├── x_test_symbols.npy
    └── y_test_symbols.npy
```

## Usage

### Default Mode (Student Development)

By default, AEGIS uses the `testing/` directory for prediction data. This is suitable for:

- Student development and testing
- Training model evaluation
- General simulation runs

### Marking Mode (Instructor/Competitive Use)

For marking scenarios, use the `--testing-for-marking` flag:

```bash
aegis --world worlds/ExampleWorld.world --agent agents/marking_agent/main.py --testing-for-marking
```

This will load prediction data from the `testing/` directory instead of `student/`.

## Data Format

Each directory contains:

- `x_test_symbols.npy` or `x_train_symbols.npy`: Image data as numpy arrays
- `y_test_symbols.npy` or `y_train_symbols.npy`: Label data as numpy arrays

## Setup Instructions

1. **For Students/Developers**: Place the provided testing data in the `student/` directory
2. **For Instructors/Tournament Organizers**:
   - Place marking data in the `testing-marking/` directory
   - Use the `--testing-for-marking` flag when running simulations
3. **Training Data**: Place training data in the `training/` directory (for model development)

## Notes

- The `testing-marking/` directory should be empty by default and only populated by instructors/tournament organizers
- The `training/` directory is for model development and is not used during normal AEGIS simulations
- All data files must follow the naming convention: `x_{type}_symbols.npy` and `y_{type}_symbols.npy`
