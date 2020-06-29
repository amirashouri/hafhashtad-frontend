import React, { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./verify.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isVerifyMode, setIsVerifyMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      phone: {
        value: "",
        isValid: false,
      },
    },
    false,
  );

  const switchModeHandler = () => {
    if (!isVerifyMode) {
      setFormData(
        {
          username: undefined,
          password: undefined,
        },
        formState.inputs.username.isValid && formState.inputs.password.isValid,
      );
    } else {
      setFormData(
        {
          username: {
            value: "",
            isValid: false,
          },
          password: {
            value: null,
            isValid: false,
          },
        },
        false,
      );
    }
    setIsVerifyMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isVerifyMode) {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/api/users/getVerificationCode",
          "POST",
          JSON.stringify({
            phone: formState.inputs.phone.value,
          }),
          {
            "Content-Type": "application/json",
          },
        );
        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    } else {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/api/roles/loginRole",
          "POST",
          JSON.stringify({
            username: formState.inputs.username.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          },
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Verify Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isVerifyMode && (
            <div>
              <Input
                element="input"
                id="username"
                type="text"
                label="Your User Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter an username."
                onInput={inputHandler}
              />
              <Input
                element="input"
                id="password"
                type="text"
                label="Your password"
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH()]}
                errorText="Please enter a password."
                onInput={inputHandler}
              />
            </div>
          )}
          {isVerifyMode && (
            <Input
              element="input"
              id="phone"
              type="phone"
              label="Phone-Number"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid phone number."
              onInput={inputHandler}
            />
          )}

          <Button type="submit" disabled={!formState.isValid}>
            {isVerifyMode ? "Send Verification Code" : "loginAdmin"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isVerifyMode ? "LOGIN" : "VERIFY"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
