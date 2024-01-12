import { Field, Form, Formik } from "formik";
import Input from "../../UI/Input";
import TextArea from "../../UI/TextArea";
import ImageUpload from "../../UI/ImageUpload";

const CustomForm = ({
  initialValues,
  onSubmit,
  validate,
  validator,
  fields,
  buttonText,
  btnClass,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      validator={validator}
    >
      <Form className="w-full">
        {fields.map((field, index) => {
          let Component = Input;
          if(field.type === "textarea"){
            Component = TextArea
          }
          if(field.type === "imageupload"){
            Component = ImageUpload
          }
          if (field.type === "checkbox") {
            return (
              <label
                key={index}
                className="label cursor-pointer inline-flex items-center"
              >
                <Field
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-400">{field.label}</span>
              </label>
            );
          }
          return (
            <Field
              key={index}
              type={field.type}
              name={field.name}
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              component={Component}
            />
          );
        })}
        <button
          className={`${
            btnClass ? btnClass : "w-full h-11"
          } bg-secondary-300 mt-4 rounded-md font-bold hover:bg-secondary-500`}
          type="submit"
        >
          {buttonText}
        </button>
      </Form>
    </Formik>
  );
};

export default CustomForm;
