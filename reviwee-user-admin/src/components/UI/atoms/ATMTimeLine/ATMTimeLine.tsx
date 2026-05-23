import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";

type Props = {
  timeLineItems: {
    leftSideContent: React.ReactNode;
    rightSideContent: React.ReactNode;
  }[];
};

const ATMTimeLine = ({ timeLineItems }: Props) => {
  return (
    <Timeline position="alternate">
      {timeLineItems?.map((item, itemIndex) => (
        <TimelineItem key={itemIndex}>
          <TimelineOppositeContent color="text.secondary">
            {item.leftSideContent}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent> {item.rightSideContent} </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default ATMTimeLine;
