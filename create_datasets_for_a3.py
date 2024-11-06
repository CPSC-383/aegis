import tensorflow as tf
import numpy as np
import os







agent_training_output_dir = os.path.join("src", "agent", "model_training_data")
ares_testing_output_dir = os.path.join("src", "ares", "agent_predictions", "model_testing_data")

os.makedirs(agent_training_output_dir, exist_ok=True)
os.makedirs(ares_testing_output_dir, exist_ok=True)

np.save(os.path.join(agent_training_output_dir, "x_train.npy"), x_train)
np.save(os.path.join(agent_training_output_dir, "y_train.npy"), y_train)
np.save(os.path.join(ares_testing_output_dir, "x_test.npy"), x_test)
np.save(os.path.join(ares_testing_output_dir, "y_test.npy"), y_test)