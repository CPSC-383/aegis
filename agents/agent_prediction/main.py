# ruff: noqa: F403 F405, INP001, D100

from pathlib import Path

import numpy as np
import tensorflow as tf

from aegis.stub import *


def think() -> None:
    """Do not remove this function, it must always be defined."""
    log("Thinking")

    # On the first round, send a request for surrounding information
    # by moving to the center (not moving). This will help initiate pathfinding.
    if get_round_number() == 1:
        send(Move(Direction.CENTER))
        return

    # Fetch the cell at the agent's current location. If the location is outside
    # the world's bounds, return a default move action and end the turn.
    cell = get_cell_info_at(get_location())
    if cell is None:
        send(Move(Direction.CENTER))
        return

    # If there is a pending prediction from a save survivour for our team, predict!
    prediction_info = get_prediction_info_for_agent()
    if prediction_info is not None:
        surv_saved_id, image_to_predict, unique_labels = prediction_info

        # Get the path to the model file in the agent's directory
        model_path = Path("agents/agent_prediction/trained_net.keras")
        if not model_path.exists():
            log("Model not found, skipping prediction")
            return

        # Load the model and make prediction like in the example
        model = tf.keras.models.load_model(str(model_path))
        # Reshape the image for the model (similar to the example)
        image = np.reshape(image_to_predict, (28, 28))
        image = np.reshape(image, (1, 28, 28))

        # Make prediction
        predictions = model(image)
        predicted_label = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        log(f"Predicted symbol: {predicted_label} with confidence: {confidence:.4f}")

        # Send the prediction using the survivor ID from the save result
        send(Predict(surv_saved_id, predicted_label))

    # Get the top layer at the agent's current location.
    # If a survivor is present, save it and make a prediction.
    if isinstance(cell.top_layer, Survivor):
        # Save the survivor
        send(Save())

        # After saving, we'll get a SaveResult with the image to predict
        # The prediction will be handled in the handle_save function
        return

    # Default action: Move the agent north if no other specific conditions are met.
    send(Move(Direction.NORTH))
