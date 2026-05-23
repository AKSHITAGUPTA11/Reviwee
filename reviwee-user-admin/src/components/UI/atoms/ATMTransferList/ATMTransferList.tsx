import * as React from "react";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import { ErrorMessage } from "formik";

function not(
  a: { label: string; value: string }[],
  b: { label: string; value: string }[]
) {
  return a.filter(
    (eleOfA) => b.findIndex((eleOfB) => eleOfA.value === eleOfB.value) === -1
  );
}

function intersection(
  a: { label: string; value: string }[],
  b: { label: string; value: string }[]
) {
  return a.filter(
    (eleOfA) => b.findIndex((eleOfB) => eleOfA.value === eleOfB.value) !== -1
  );
}

type Props = {
  name: string;
  leftSideTitle: string;
  rightSideTitle: string;
  options: { label: string; value: string }[];
  right: { label: string; value: string }[];
  setRight: (newValue: { label: string; value: string }[]) => void;
};

const ATMTransferList = ({
  leftSideTitle,
  rightSideTitle,
  options,
  name,
  right,
  setRight,
}: Props) => {
  const [checked, setChecked] = React.useState<
    { label: string; value: string }[] | []
  >([]);
  const [left, setLeft] = React.useState(options);
  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: { label: string; value: string }) => () => {
    const currentIndex = checked.findIndex((ele) => ele.value === value.value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: { label: string; value: string }[]) =>
    intersection(checked, items).length;

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (
    title: React.ReactNode,
    items: { label: string; value: string }[],
    listType: "left" | "right"
  ) => (
    <Card className="h-full">
      <div className="px-7 py-2 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="text-lg font-medium">{title}</div>
          <div>{`${numberOfChecked(items)}/${items.length} selected`}</div>
        </div>
        {items.length ? (
          <button
            onClick={() => {
              if (listType === "left") {
                setRight(right.concat(left));
                setLeft([]);
              } else {
                setLeft(left.concat(right));
                setRight([]);
              }
              setChecked([]);
            }}
            className="bg-primary-main py-1 px-3 rounded text-white"
          >
            {listType === "left" ? "Move All" : "Remove All"}
          </button>
        ) : null}
      </div>
      <Divider />
      <List
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "background.paper",
          overflow: "auto",
        }}
        dense
        component="div"
        role="list"
      >
        {items.map((item: { label: string; value: string }) => {
          const labelId = `transfer-list-all-item-${item.value}-label`;

          return (
            <ListItemButton
              key={item.value}
              role="listitem"
              onClick={handleToggle(item)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={
                    checked.findIndex((ele) => ele.value === item.value) !== -1
                  }
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );

  return (
    <div className="relative h-full">
      <div className="flex gap-5 h-full items-center ">
        <div className="flex-1 h-full">
          {customList(leftSideTitle, left, "left")}
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              className={`${
                leftChecked?.length > 0 && "bg-primary-main text-white"
              } py-1 px-6 rounded border text-slate-300 border-slate-300`}
              aria-label="move selected right"
            >
              &gt;
            </button>
            <button
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              className={`${
                rightChecked?.length > 0 && "bg-primary-main text-white"
              } py-1 px-6 rounded border text-slate-300 border-slate-300`}
              aria-label="move selected left"
            >
              &lt;
            </button>
          </div>
        </div>
        <div className="flex-1 h-full">
          {customList(rightSideTitle, right, "right")}
        </div>
      </div>

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500  ">
              {" "}
              {errMsg}{" "}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMTransferList;
