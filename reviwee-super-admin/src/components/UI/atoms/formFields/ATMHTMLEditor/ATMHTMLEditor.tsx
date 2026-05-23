// import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { ErrorMessage } from "formik";
import 'src/App.css'

type Props = {
  name: string;
  value: any;
  onChange: (newValue: any) => void;
};

const ATMHTMLEditor = ({ name, value: _value, onChange: _onChange }: Props) => {

  return (
    <div className="relative">
      {/* <Editor
        editorState={value}
        onEditorStateChange={(newValue) => onChange(newValue)}
        toolbarClassName="toolbarclassName="
        wrapperClassName="wrapperclassName=  "
        editorClassName="editorclassName= px-3 border min-h-[180px]"
        onTab={onHandleKeyBindings}
        toolbar={{
          image: {
            urlEnabled: true,
            uploadEnabled: true,
            uploadCallback: uploadImageCallBack,
            previewImage: true,
            alt: { present: true, mandatory: true },
          },
        }}
        placeholder="Write script here..."
      /> */}

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => {
           return  <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
              {" "}
              {errMsg}{" "}
            </p>
          }}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMHTMLEditor;
