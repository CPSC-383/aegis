from pathlib import Path

import numpy as np
import tensorflow as tf


def train_model():
    """Train and save a simple placeholder symbol prediction model."""

    # Load training data
    data_dir = Path(__file__).parent.parent.parent / "prediction_data" / "training"
    x_train = np.load(data_dir / "x_train_symbols.npy")
    y_train = np.load(data_dir / "y_train_symbols.npy")

    # Normalize the data
    x_train = x_train.astype("float32") / 255.0

    # Convert labels to categorical
    num_classes = len(np.unique(y_train))
    y_train = tf.keras.utils.to_categorical(y_train, num_classes)

    # Create model
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Flatten(input_shape=(28, 28)),
            tf.keras.layers.Dense(128, activation="relu"),
            tf.keras.layers.Dense(num_classes, activation="softmax"),
        ]
    )

    # Compile model
    model.compile(
        optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"]
    )

    # Train model
    model.fit(x_train, y_train, epochs=10, batch_size=32, validation_split=0.2)

    # Save model
    model.save("trained_net.keras")


if __name__ == "__main__":
    train_model()
