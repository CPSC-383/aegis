import tensorflow as tf
import numpy as np
import os

(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()

x_train = x_train.astype("float32") / 255
x_test = x_test.astype("float32") / 255

agent_training_output_dir = os.path.join("src", "agent", "training_data")
ares_testing_output_dir = os.path.join("src", "ares", "testing_data")

os.makedirs(agent_training_output_dir, exist_ok=True)
os.makedirs(ares_testing_output_dir, exist_ok=True)

# Save the datasets locally as .npy files
np.save(os.path.join(agent_training_output_dir, "x_train.npy"), x_train)
np.save(os.path.join(agent_training_output_dir, "y_train.npy"), y_train)
np.save(os.path.join(ares_testing_output_dir, "x_test.npy"), x_test)
np.save(os.path.join(ares_testing_output_dir, "y_test.npy"), y_test)

print(f"Training and testing data saved to the directory: {ares_testing_output_dir}")
