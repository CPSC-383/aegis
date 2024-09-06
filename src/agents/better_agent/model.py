import os
import random

import numpy as np

# This has to go before tf is initialized.
# 0 = all messages,
# 1 = INFO messages only
# 2 = WARNING messages only
# 3 = ERROR messages only
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf
from tensorflow.keras.datasets import mnist


class Model:
    def __init__(self) -> None:
        script_dir = os.path.dirname(os.path.realpath(__file__))
        self._model_path = os.path.join(script_dir, "model.keras")
        self._model = None

    def _load_data(self):
        (x_train, y_train), (x_test, y_test) = mnist.load_data()
        x_train, x_test = x_train / 255.0, x_test / 255.0
        return x_train, y_train, x_test, y_test

    def _build_model(self):
        inputs = tf.keras.Input(shape=(28, 28))

        x = tf.keras.layers.Flatten()(inputs)
        x = tf.keras.layers.Dense(128, activation="relu")(x)
        x = tf.keras.layers.Dropout(0.2)(x)
        outputs = tf.keras.layers.Dense(10)(x)

        model = tf.keras.Model(inputs=inputs, outputs=outputs)

        model.compile(
            optimizer="adam",
            # loss="sparse_categorical_crossentropy",  # Use this for testing wrong preditions as the accuracy SUCKS
            loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
            metrics=["accuracy"],
        )
        return model

    def _train_model(self):
        x_train, y_train, _, _ = self._load_data()
        model = self._build_model()
        # Verbose = 0 hides epoch progress bars
        model.fit(x_train, y_train, epochs=5, verbose=0)
        model.save(self._model_path)
        return model

    def _load_model(self):
        model = tf.keras.models.load_model(self._model_path)
        return model

    def get_model(self):
        if os.path.isfile(self._model_path):
            print("Model found. Loading model...")
            model = self._load_model()
            self._model = model
            return model
        print("Model not found. Training a new model...")
        model = self._train_model()
        self._model = model
        return model

    def predict(self) -> bool:
        _, _, x_test, y_test = self._load_data()

        model = self._model

        index = random.randint(0, len(x_test) - 1)

        image = x_test[index]
        label = y_test[index]

        image = np.expand_dims(image, axis=0)
        predictions = model.predict(image, verbose=0)
        predicted_label = np.argmax(predictions[0])

        return label == predicted_label
