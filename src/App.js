import React from "react"
import './App.css';
import { useState } from 'react';
import currencyCodes from './resources/codes.json'
import conversions from './resources/conversions.json'
import { AppBar, Toolbar, TextField, FormHelperText } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SwapHorizontalCircleOutlinedIcon from '@material-ui/icons/SwapHorizontalCircleOutlined';
import errorSound from './resources/error.mp3';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    // padding: theme.spacing(2),
    minWidth: 285,
    minHeight: 56,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    minWidth: 275,
    display: 'flex',
    flexWrap: 'wrap',
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px"
  },
  cardContent: {
    alignContent: 'center',
    alignItems: "center",
    textAlign: 'center'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,

    alignItems: 'left'
  },
  pos: {
    marginBottom: 12,
  },
  label: {
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  }
}));

function App() {
  const classes = useStyles();
  const currencies = currencyCodes;
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [selectedFromCurrency, setSelectedFromCurrency] = useState([]);
  const [toCurrency, setToCurrency] = useState("");
  const [selectedToCurrency, setSelectedToCurrency] = useState([]);
  var finalAnsFound = false;
  var result_1;
  const [needToShow, setNeedToShow] = useState(false);
  const [finalAns, setFinalAns] = useState();
  const [finalOp, setFinalOp] = useState();
  const [submitted, setSubmitted] = useState(false);

  console.log(fromCurrency)

  const Swap = () => {
    setFromCurrencyOwn(toCurrency)
    setToCurrencyOwn(fromCurrency)
  }

  const setFromCurrencyOwn = (value) => {
    setFromCurrency(value)
    result_1 = amount;
    setSelectedFromCurrency(currencies.filter(cur => {
      if (cur.currency === value) {
        return cur;
      }
    }))
  }
  const setToCurrencyOwn = (value) => {
    setToCurrency(value)
    result_1 = amount;
    setSelectedToCurrency(currencies.filter(cur => {
      if (cur.currency === value) {
        return cur;
      }
    }))
  }

  const calcAns = (conversion) => {
    if (conversion === null) {
      return;
    }
    // console.log("Searching for : " + conversion.code+" conversion.dir : "+conversion.dir+" result : "+result_1);
    if (conversion.dir === "to") {
      const searchTo = [];
      conversions.filter(cnv => {
        if (cnv.from === conversion.code && cnv.to !== conversion.etc) {
          searchTo.push({ "code": cnv.to, "dir": "to", "rate": cnv.rate, "etc": cnv.from });
          return cnv;
        }
      });
      conversions.filter(cnv => {
        if (cnv.to === conversion.code && cnv.from !== conversion.etc) {
          searchTo.push({ "code": cnv.from, "dir": "from", "rate": cnv.rate, "etc": cnv.to });
          return cnv;
        }
      });
      console.table(searchTo)
      if (conversion.code === selectedToCurrency[0].currency) {
        if (conversion.dir === "from") {
          result_1 = result_1 / conversion.rate;
        } else {
          result_1 = result_1 * conversion.rate;
        }
        finalAnsFound = true;
        // setFinalAns(result_1.toFixed(selectedToCurrency[0].decimal));
        setFinalOp(amount + " " + selectedFromCurrency[0].currency + " = " + result_1.toFixed(selectedToCurrency[0].decimal) + " " + selectedToCurrency[0].currency);
        setFinalAns(result_1);
        console.log("0Final Answer Is : " + result_1)
        calcAns(null);
        return;
      }
      if (searchTo.length !== 0) {
        var j;
        for (j = 0; j < searchTo.length; j++) {
          if (!finalAnsFound) {
            calcAns(searchTo[j]);
          }
        }
      }
    }
    if (conversion.dir === "from") {
      const searchFrom = [];
      conversions.filter(cnv => {
        if (cnv.to === conversion.code && cnv.from !== conversion.etc) {
          searchFrom.push({ "code": cnv.from, "dir": "from", "rate": cnv.rate, "etc": cnv.to });
          return cnv;
        }
      });
      conversions.filter(cnv => {
        if (cnv.from === conversion.code && cnv.to !== conversion.etc) {
          searchFrom.push({ "code": cnv.to, "dir": "to", "rate": cnv.rate, "etc": cnv.from });
          return cnv;
        }
      });
      console.table(searchFrom)
      if (conversion.code === selectedToCurrency[0].currency) {
        if (conversion.dir === "from") {
          console.log("searchFromcode : "+conversion.code+" action : /"+" result : "+result_1)
          result_1 = result_1 / conversion.rate;
        } else {
          console.log("searchFromcode : "+conversion.code+" action : *"+" result : "+result_1)
          result_1 = result_1 * conversion.rate;
        }
        // console.log("Final Answer Is : " + result_1)
        finalAnsFound = true;
        setFinalOp(amount + " " + selectedFromCurrency[0].currency + " = " + result_1.toFixed(selectedToCurrency[0].decimal) + " " + selectedToCurrency[0].currency);
        setFinalAns(result_1);
        // console.log("Final Answer Is : " + result_1)
        calcAns(null);
        return;
      }
      if (searchFrom.length !== 0) {
        var j;
        for (j = 0; j < searchFrom.length; j++) {
          if (!finalAnsFound) {
            calcAns(searchFrom[j]);
          }
        }
      }
    }
  }
  const currencyConvertor = async () => {
    setSubmitted(true);
    if (amount && fromCurrency && toCurrency) {
      result_1 = amount;
      const from = selectedFromCurrency[0]
      const to = selectedToCurrency[0]
      if(from.currency === to.currency)
      {
        setFinalOp(amount + " " + from.currency + " = " + parseFloat(amount).toFixed(to.decimal) + " " + to.currency);
        setNeedToShow(true);
        return;
      }
      const fromFinds = [];
      const d_rates = conversions.filter(cnv => {
        if (cnv.from === from.currency) {
          fromFinds.push({ "code": cnv.to, "dir": "to", "rate": cnv.rate, "etc": cnv.from });
          return cnv;
        } else {
          if (cnv.to === from.currency) {
            fromFinds.push({ "code": cnv.from, "dir": "from", "rate": cnv.rate, "etc": cnv.to });
            return cnv;
          } else {

          }
        }
      })
      var i = 0;
      var finalAnsFound1 = false;
      
      const findCombination = conversions.filter(data => {
        return data.from===selectedFromCurrency[0].currency && data.to===selectedToCurrency[0].currency;
      })
      for (i = 0; i < fromFinds.length; i++) {
        if (fromFinds[i].dir === "from") {
          console.log("code : "+fromFinds[i].code+" action : /"+" result : "+result_1)
          result_1 = result_1 / fromFinds[i].rate;
        } else {
          console.log("code : "+fromFinds[i].code+" action : *"+" result : "+result_1)
          result_1 = result_1 * fromFinds[i].rate;
        }
        if (fromFinds[i].code === selectedToCurrency[0].currency) {
          finalAnsFound1 = true;
          
          setFinalOp(amount + " " + selectedFromCurrency[0].currency + " = " + result_1.toFixed(selectedToCurrency[0].decimal) + " " + selectedToCurrency[0].currency);
          // console.log("2Final Answer Is : " + result_1)
          setFinalAns(result_1);
          break;
        }
        if(findCombination.length!=0)
        {
        result_1 = amount;
        }
      }
      
      if (finalAnsFound1 !== true) {
        result_1 = amount;
        for (i = 0; i < fromFinds.length; i++) {
          if (fromFinds[i].dir === "from") {
            console.log("code : "+fromFinds[i].code+" action : /"+" result : "+result_1)
            result_1 = result_1 / fromFinds[i].rate;
          } else {
            console.log("code : "+fromFinds[i].code+" action : *"+" result : "+result_1)
            result_1 = result_1 * fromFinds[i].rate;
          }
          calcAns(fromFinds[i]);
          result_1 = amount;
        }
      }
      if (!finalAnsFound1 && !finalAnsFound) {
        setNeedToShow(false);
        new Audio(errorSound).play()
        toast.error('Unable to find rate for ' + selectedFromCurrency[0].currency + "/" + selectedToCurrency[0].currency, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        setNeedToShow(true);
      }
      setSubmitted(false);
    }
  }
  return (
    <div className="App" >
      <div className="AppContainer">
        <ToastContainer />
        <AppBar position="static" style={{
          borderTopRightRadius: "10px",
          borderTopLeftRadius: "10px"
        }}>
          <Toolbar>
            <h3>Currency Converter</h3>
          </Toolbar>
        </AppBar>
        <Card className={classes.root} >
          <CardContent className={classes.cardContent}>
            <Typography className={classes.title} color="textSecondary" gutterBottom component={'span'}>
              <TextField id="outlined-basic"
                className={classes.formControl}
                label="Enter Amount"
                variant="outlined"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                error={submitted && amount === ""}
                helperText={submitted && amount === "" ? 'Please Enter Amount' : ' '}
                type="number"
              />
  
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">From Currency</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={fromCurrency}
                  onChange={event => {
                    setFromCurrencyOwn(event.target.value)
                  }}
                  label="From Currency"
                  error={submitted && fromCurrency === ""}
                // helperText={ submitted && fromCurrency? 'Empty!' : ' '}
                >
                  {currencies.map(cur => (
                    <MenuItem key={cur.currency} value={cur.currency}>{cur.currency}</MenuItem>
                  ))}
                </Select>
                {
                  submitted && !fromCurrency ?
                    <FormHelperText style={{ color: "red" }} >Please Select Currency</FormHelperText> : ""
                }

              </FormControl>
              <SwapHorizontalCircleOutlinedIcon style={{ marginTop: "22px" }} onClick={Swap} />
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">To Currency</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={toCurrency}
                  onChange={event => setToCurrencyOwn(event.target.value)}
                  label="To Currency"
                  error={submitted && toCurrency === ""}
                >
                  {currencies.map(cur => (
                    <MenuItem key={cur.currency} value={cur.currency}>{cur.currency}</MenuItem>
                  ))}
                </Select>
                {
                  submitted && !toCurrency ?
                    <FormHelperText style={{ color: "red" }} >Please Select Currency</FormHelperText> : ""
                }
              </FormControl>
              <FormControl>
                <Button variant="contained" color="primary" className={classes.formControl}
                  onClick={() => {
                    currencyConvertor()
                  }
                  }>
                  Convert Currency
                </Button>
              </FormControl>
            </Typography>
            {needToShow && <div className={classes.label}><h2>{finalOp}</h2></div>}
          </CardContent>
          <CardActions>
            {/* <Button size="large">Thank you</Button> */}
          </CardActions>
        </Card>
      </div>
    </div>
  );
}

export default App;
