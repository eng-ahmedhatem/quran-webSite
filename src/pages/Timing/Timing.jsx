import {useState} from "react";
import * as React from 'react';

import "./timing.css";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { FaRegCalendarAlt } from "react-icons/fa";
function SalahCard({name , time ,next}) {
  return (
    <div className={`salah-card ${next && "next"}`}>
      {next && <span className="nextSalah">
        الصلاة التالية
      </span>}
      <h2>{name}</h2>
      {next && <span className="timeNext">
        01:21:29
      </span>}
      <p>{time}</p>
    </div>
  )

}
export default function Timing() {
  const [age, setAge] = useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  }
  return (
    <div className="Timing">
      <div className="row-1">
        <div className="text-day">
          <h4>اليوم<FaRegCalendarAlt/></h4>
          <p>
            <span>6</span> <span>رمضان</span>
            <span>1441</span>
          </p>
          <p>
            <span>30</span> <span>ابريل</span>
            <span>2020</span>
          </p>
        </div>
        <div className="text-location">
          <h1>اوقات الصلاة في <span>القاهرة</span></h1>
          <Box >
          <FormControl fullWidth variant="filled" sx={{fontSize:"16px"}}>
        <InputLabel
        sx={{borderRadius:"10px",fontFamily:"Readex-light",fontSize:"16px",color:"var(--main-text-color)"}}
        id="selectCountry">اختر المدينة</InputLabel>
        <Select
        sx={{fontSize:"16px",color:"var(--main-text-color)",fontFamily:"Readex-light"}}
          labelId="selectCountry"
          id="selectCountry_id"
          value={age}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem  value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>





















    </Box>
        </div>
      </div>
      <div className="row-2">
        <div className="cards">
          <SalahCard name={"المغرب"} time={"06:25"} next/>
          <SalahCard name={"المغرب"} time={"06:25"}/>
          <SalahCard name={"المغرب"} time={"06:25"}/>
          <SalahCard name={"المغرب"} time={"06:25"}/>
          <SalahCard name={"المغرب"} time={"06:25"}/>
        </div>
      </div>
    </div>
  );
}
