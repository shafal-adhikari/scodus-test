import { Table } from "antd";
import React, { useEffect, useState } from "react";
import "antd/dist/antd.min.css";
import axios from "./config";
import moment from "moment";
import "./App.css";

const App = () => {
  const monthColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (text, record) => {
        return (
          <a
            onClick={() => {
              setTableData(record.weeks);
              setTableColumns(weekColumns);
            }}
          >
            {record.month}
          </a>
        );
      },
    },
    {
      title: "Contract Hours",
      dataIndex: "contractHours",
      key: "contractHours",
      render: (text, record) => {
        const adjustmentHours = record.actualHours - record.contractHours;
        return (
          <>
            <span>{text}</span>
            <br />
            <span className={adjustmentHours >= 0 ? "Green" : "Red"}>
              {adjustmentHours > 0 && "+"}
              {record.actualHours - record.contractHours} hrs
            </span>
          </>
        );
      },
    },
    {
      title: "Actual Hours",
      dataIndex: "actualHours",
      key: "actualHours",
    },
  ];
  const weekColumns = [
    {
      title: "Week",
      dataIndex: "week",
      key: "week",
      render: (text, record) => {
        return (
          <a
            onClick={() => {
              setTableData(record.days);
              setTableColumns(dayColumns);
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: "Contract Hours",
      dataIndex: "contractHours",
      key: "contractHours",
      render: (text, record) => {
        const adjustmentHours = record.actualHours - record.contractHours;
        return (
          <>
            <span>{text}</span>
            <br />
            <span className={adjustmentHours >= 0 ? "Green" : "Red"}>
              {adjustmentHours > 0 && "+"}
              {record.actualHours - record.contractHours} hrs
            </span>
          </>
        );
      },
    },
    {
      title: "Actual Hours",
      dataIndex: "actualHours",
      key: "actualHours",
    },
  ];
  const dayColumns = [
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Contract Hours",
      dataIndex: "contractHours",
      key: "contractHours",
      render: (text, record) => {
        const adjustmentHours = record.actualHours - record.contractHours;
        return (
          <>
            <span>{text}</span>
            <br />
            <span className={adjustmentHours >= 0 ? "Green" : "Red"}>
              {adjustmentHours > 0 && "+"}
              {record.actualHours - record.contractHours} hrs
            </span>
          </>
        );
      },
    },
    {
      title: "Actual Hours",
      dataIndex: "actualHours",
      key: "actualHours",
    },
  ];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [data, setData] = useState([]);
  const [tabData, setTabData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState(monthColumns);
  const getLastWeekContractedHours = (month, contractedHours) => {
    const date =
      "2022-" +
      month.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
    const totalDaysinMonth = moment(date, "YYYY-MM").daysInMonth();
    let lastweekHours = 0;
    for (let i = 29; i <= totalDaysinMonth; i++) {
      let day = moment(date + "-" + i, "YYYY-MM-DD").format("dddd");
      lastweekHours = lastweekHours + contractedHours[day];
    }
    return lastweekHours;
  };
  useEffect(() => {
    const getAllTasks = async () => {
      try {
        const { data } = await axios.get("/employee-tasks");
        const response = await axios.get("/employee-contracted-hours");
        const contractedHours = await response.data;
        let weekTotalHours = 0;
        for (let key in contractedHours) {
          weekTotalHours = weekTotalHours + contractedHours[key];
        }
        let newArray = Array.from({ length: 12 }, (_, i) => {
          return {
            month: new moment().month(i).format("MMMM"),
            actualHours: 0,
            contractHours:
              weekTotalHours * 4 +
              getLastWeekContractedHours(i + 1, contractedHours),
            weeks: Array.from({ length: 5 }, (_, j) => {
              return {
                week: "Week " + (j + 1),
                contractHours:
                  j == 4
                    ? getLastWeekContractedHours(i + 1, contractedHours)
                    : weekTotalHours,
                actualHours: 0,
                days: Array.from({ length: 7 }, (_, k) => {
                  return {
                    day: dayNames[k],
                    actualHours: 0,
                    contractHours: contractedHours[dayNames[k]],
                  };
                }),
              };
            }),
          };
        });
        data.forEach((eachData, i) => {
          //day for contracted hours mapping
          let day = moment(eachData.task_date).format("dddd");

          //finding month number, dayNum  and weekNumber to populate data array
          let month = moment(eachData.task_date).month();
          let dayNum = moment(eachData.task_date).day();
          let weekNum = Math.ceil(moment(eachData.task_date).date() / 7);

          //accessing month object in data array
          let monthObj = newArray[month];
          //accesssing week object in data array since weekNum is from 1-7 in array we go 0-6
          let weekObj = monthObj.weeks[weekNum - 1];

          //accessing dayObj inside of the accessed weekObj
          let dayObj = weekObj.days[dayNum];

          //previously added total contract hours and actual hours
          const prevActualHoursMnth = monthObj.actualHours;

          //previously added week actual hours
          const prevActualHrsWeek = weekObj.actualHours;

          //previously added day contract hours and actual hours
          const prevActualHrsDay = dayObj.actualHours;

          //current actual_in and actual_out
          const actual_in = eachData.actual_in;
          const actual_out = eachData.actual_out;

          //new actual hour if there is actual_in and actual_out
          const newActualHour =
            actual_in !== null && actual_out !== null
              ? moment(actual_out).diff(actual_in, "hours")
              : 0;
          newArray[month] = {
            ...monthObj,
            key: eachData.task_id,
            actualHours: prevActualHoursMnth + newActualHour,
          };
          newArray[month].weeks[weekNum - 1] = {
            ...weekObj,
            key: eachData.task_id,
            actualHours: prevActualHrsWeek + newActualHour,
          };
          newArray[month].weeks[weekNum - 1].days[dayNum] = {
            day: day,
            key: eachData.task_id,
            contractHours: contractedHours[day],
            actualHours: prevActualHrsDay + newActualHour,
          };
        });
        setData(newArray.filter((month) => month.month !== ""));
        setTableData(newArray.filter((month) => month.month !== ""));
      } catch (error) {
        console.log(error ? error : error.response);
      }
    };
    getAllTasks();
  }, []);

  const onChange = (index) => {
    // setTableData()
  };
  return (
    <>
      <Table columns={tableColumns} dataSource={tableData} />
    </>
  );
};

export default App;
