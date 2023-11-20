import React from "react";
import { Field, Formik, Form } from "formik";
import Input from "../UI/Input";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
const Auth = () => {
   const dispatch =  useDispatch();
   const history = useHistory();
  const initialValues = {
    email: "",
    password: "",
  };
  const onSubmit = (values) => {
    console.log("Form values:", values);
    dispatch(login({
        user: values,
        permissions: [],
        role: null,
    }))
    history.push("/");
  };

  const validate = (values) => {
    const errors = {};

    if (!values.email || !values.email.length) {
      errors.email = "Email is required";
    }
    if (
      !values.email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      errors.email = "Email is not valid";
    }

    if (!values.password || !values.password.length) {
      errors.password = "Password is required";
    }

    return errors;
  };
  return (
    <div className="font-sans">
      <div className="h-screen flex items-center justify-center bg-cover bg-center">
        <div
          className="w-6/12 h-full "
          style={{
            backgroundImage:
              'url("https://img.freepik.com/free-photo/vintage-old-rustic-cutlery-dark_1220-4886.jpg?w=1800&t=st=1700301470~exp=1700302070~hmac=55f8b086ddbebc8ff0870a8ea8e96015bd274f3bffb334763e3a6b1509e2149c")',
          }}
        ></div>
        <div className="w-6/12 h-full bg-primary-700">
          <div className="w-full h-full flex justify-center items-center">
            <div className="bg-primary-50 w-7/12 px-6 py-8 text-gray-200 rounded-lg shadow-2xl">
              <h3 className="text-3xl font-bold my-4">Sign In</h3>
              <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validate={validate}
                validator={() => ({})}
              >
                <Form>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    label="Email"
                    placeholder="Your Email"
                    component={Input}
                  />
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    label="Password"
                    placeholder="Your Password"
                    component={Input}
                  />
                  <button
                    className="bg-secondary-300 w-full mt-4 rounded-md h-11 font-bold hover:bg-secondary-500"
                    type="submit"
                  >
                    Login
                  </button>
                </Form>
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;