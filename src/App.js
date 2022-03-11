import {
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import "./App.css";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

//  https://disease.sh/v3/covid-19/countries
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setmapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          setCountries(
            data.map((country) => ({
              name: country["country"],
              value: country["countryInfo"]["iso2"],
            }))
          );
          setmapCountries(data);
          setTableData(sortData(data));
        });
    };
    getCountriesData();
  }, []);

  useEffect(() => {
    const call = async () => {
      await fetch("https://disease.sh/v3/covid-19/all")
        .then((data) => data.json())
        .then((data) => {
          setCountryInfo(data);
        });
    };
    call();
  }, []);

  const onCountryChange = async (event) => {
    const url =
      event.target.value === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${event.target.value}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(event.target.value);
        setCountryInfo(data);
        console.log(data);
        setMapCenter({
          lat: Number(data.countryInfo.lat),
          lng: Number(data.countryInfo.long),
        });
        setMapZoom(6);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1 className="app__heading">Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            active={casesType === "cases"}
            onClick={() => setCasesType("cases")}
            title={"Coronavirus Cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === "recovered"}
            onClick={() => setCasesType("recovered")}
            title={"Recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            active={casesType === "deaths"}
            onClick={() => setCasesType("deaths")}
            title={"Deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map
          caseType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3 className="graph__heading">WorldWide New {casesType}</h3>
          <LineGraph className="app__graph" caseType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
