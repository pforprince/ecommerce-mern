// Dependencies
import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import axios from 'axios';

import 'react-phone-input-2/lib/style.css';
import styled, { css } from 'styled-components';
import * as Icon from '@material-ui/icons';
import jssip from 'jssip';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Toggle from '../form/toggle';
import Grid from '@material-ui/core/Grid';
// Components
import theme from '../../../theme';
import Select from '../form/select';

import {
  testCall,
  initialize,
  hangCall,
  sendMssg,
  toggleMute,
} from '../../activity/test';
import { width } from '@material-ui/system';

// DialControlBar component
const DialControlBar = () => {
  const [selectedExtension, setSelectedExtension] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('201-555-0123');
  const containerRef = useRef();
  const dragRef = useRef();

  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  useEffect(() => {
    makeDraggable(containerRef.current);
  }, []);

  const [showMsg, handleShowMssg] = useState(false);
  const [sendMsg, handleSendMsg] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, handleShowNotes] = useState(false);
  const [isCallRegistered, setCallStatus] = useState(false);
  const [isCallStarted, setCallStartedStatus] = useState(false);
  const [extensionsData, setExtensionsData] = useState([]);
  const [recordEnable, setRecordEnableValue] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setMuted] = useState(false);

  const items = extensionsData.map(extension => {
    return {
      label: (
        <Label key={0}>
          {/* <Flag src="/images/flag-1.png" /> */}
          <Text
            style={{ color: 'black', fontSize: 14 }}
          >{`(+${extension['extension']}) - ${extension/.Zoutbound_caller_id_name}`}</Text>
        </Label>
      ),
      value: extension,
    };
  });

  const makeDraggable = element => {
    const onMouseUp = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    const onMouseMove = e => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.left = element.offsetLeft - pos1 + 'px';
      element.style.top = element.offsetTop - pos2 + 'px';
    };

    dragRef.current.onmousedown = e => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmousemove = onMouseMove;
      document.onmouseup = onMouseUp;
    };
  };

  React.useEffect(() => {
    initialize();
    axios
      .get(
        `https://cors-anywhere.herokuapp.com/http://45.34.23.218:8000/api/extensions`
      )
      .then(({ data }) => {
        setExtensionsData(data);
      });
  }, []);

  function setTime() {
    const updatedvalue = callTimer + 1;
    setCallTimer(updatedvalue);
  }

  function pad(val) {
    var valString = val + '';
    if (valString.length < 2) {
      return '0' + valString;
    } else {
      return valString;
    }
  }

  const handleMute = () => {
    isCallStarted && toggleMute(isMuted);
    setMuted(!isMuted);
  };

  React.useEffect(() => {
    let myInterval = null;
    if (isCallStarted) {
      myInterval = setInterval(setTime, 1000);
    } else if (!isCallStarted) {
      if (myInterval) {
        clearInterval(myInterval);
      }
      setCallTimer(0);
    }

    return () => {
      myInterval && clearInterval(myInterval);
    };
  }, [isCallStarted, callTimer]);

  React.useEffect(() => {
    // setSelectedExtension(extensionsData[0]);
  }, [extensionsData]);

  const makeCall = () => {
    console.log('calling', phoneNumber);
    handleShowNotes(true);
    testCall(phoneNumber, setCallStartedStatus);
  };
  const hangupCall = () => {
    console.log('hanging call');
    handleShowNotes(false);
    hangCall();
  };
  const sndMssg = () => {
    // console.log('hanging call');
    handleShowMssg(true);
    // sendMssg(phoneNumber);
  };

  return (
    <Container>
      <Container ref={containerRef}>
        {showNotes ? (
          <div
            style={{
              position: 'absolute',
              backgroundColor: '#ffffd6',
              width: 'auto',
              bottom: 42,
              minWidth: 'fit-content',
              left: 0,
              padding: 10,
              marginTop: 2,
              marginBottom: 2,
              marginLeft: 4,
              marginRight: 4,
            }}
          >
            <TextField
              id="outlined-basic-email"
              label="Take Notes"
              // fullWidth
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        ) : null}

        {showNotes ? (
          <div
            style={{
              color: 'white',
              // width: '100%',
              // margin: 1px 6px;
              width: 'auto',
              marginTop: 2,
              marginBottom: 2,
              marginLeft: 4,
              marginRight: 4,
              bottom: -40,
              display: 'flex',
              alignItems: 'center',
              left: 0,
              padding: 10,
            }}
          >
            <Icon.Person fontSize="small" />
            <p style={{ marginLeft: 4 }}>
              {selectedExtension.outbound_caller_id_name}
            </p>
            <Icon.Loop fontSize="small" />
            <p style={{ marginRight: 4, marginLeft: 4 }}>{phoneNumber}</p>
          </div>
        ) : null}

        {!showNotes ? (
          <>
            <PhoneInput
              country={'us'}
              countryCodeEditable={true}
              inputProps={{
                autoFocus: true,
              }}
              containerClass={{ width: '10px' }}
              inputStyle={{ width: '170px' }}
              // containerStyle={{ maxWidth: '200px', marginRight: '6px' }}
              dropdownStyle={{ width: '210px' }}
              //containerClass={phonenumber}
              value={phoneNumber}
              onChange={e => {
                setPhoneNumber(e);
              }}
            />

            <SelectBox
              items={items}
              value={selectedExtension}
              label={selectedExtension ? null : 'Select extension'}
              onChange={value => {
                setCallStatus(true);
                setSelectedExtension(value);
              }}
              height={35}
              style={{ borderRadius: 5, minWidth: 100, width: 120 }}
              border="none"
            />
          </>
        ) : null}

        {showNotes ? (
          <Button onClick={handleMute}>
            {isMuted ? <Icon.MicOff /> : <Icon.Mic />}
          </Button>
        ) : null}

        {!showNotes ? (
          <Toggle
            name="record"
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              marginLeft: 15,
              // marginRight: 6,
            }}
            label={<ToggleLabel>{'Record'}</ToggleLabel>}
            value={recordEnable}
            onChange={e => setRecordEnableValue(e.target.checked)}
            size="small"
          />
        ) : (
          <div
            style={{
              width: 15,
              height: 12,
              borderRadius: 23,
              backgroundColor: recordEnable ? 'red' : 'gray',
            }}
          ></div>
        )}

        {isCallStarted ? (
          <div>
            <p
              style={{ paddingRight: 4, paddingLeft: 4, color: 'white' }}
            >{`${pad(parseInt(callTimer / 60))}:${pad(callTimer % 60)}`}</p>
          </div>
        ) : null}
        {/* /*<PhoneNumber
        type="text"
        value={phoneNumber}
        onChange={e => {
          setPhoneNumber(e.target.value);
        }}
      /> */}
        {!showNotes ? (
          <div
            style={{
              paddingTop: 3,
              paddingBottom: 3,
              paddingLeft: 6,
              paddingRight: 6,
              backgroundColor: '#41a548',
              color: 'white',
              display: 'flex',
              marginLeft: 6,
              borderRadius: 20,
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={makeCall}
          >
            
            <Icon.Phone fontSize="small" />
            &nbsp;
            <p style={{ paddingRight: 4, paddinLeft: 4 }}>{selectedExtension==null? "Choose Extension": "Call"}</p>
          </div>
        ) : (
          <div
            style={{
              padding: 8,
              backgroundColor: 'red',
              color: 'white',
              display: 'flex',
              marginLeft: 6,
              borderRadius: 20,
              alignItems: 'center',
              width: 35,
              height: 35,
              marginTop: 4,
              marginRight: 6,
              cursor: 'pointer',
            }}
            onClick={hangupCall}
          >
            <Icon.CallEnd fontSize="small" />
          </div>
        )}
        {/* <RoundedIcon
          bgColor={theme.colors.lightBlue}
          color={theme.colors.gray2}
          onClick={sndMssg}
        >
          <Icon.Sms />
        </RoundedIcon> */}

        {!showNotes ? (
          <div
            style={{
              paddingTop: 3,
              paddingBottom: 3,
              paddingLeft: 6,
              paddingRight: 6,
              backgroundColor: theme.colors.lightBlue,
              color: 'white',
              display: 'flex',
              marginLeft: 6,
              borderRadius: 20,
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={sndMssg}
          >
            <Icon.Sms fontSize="small" />
            &nbsp;
            <p style={{ paddingRight: 4, paddinLeft: 4 }}>Message</p>
          </div>
        ) : null}

        <VrLine />

        {!showNotes ? (
          !isCallRegistered ? (
            <Notification>
              <Icon.Warning />
              Inactive
            </Notification>
          ) : (
            <Notification style={{ color: '#41a548' }}>
              <Icon.Check />
              Active
            </Notification>
          )
        ) : null}

        {!showNotes ? (
          <Button>
            <Icon.RemoveRedEye />
          </Button>
        ) : null}

        {/* <Button>
          <Icon.Settings />
        </Button> */}
        <DragIndicator ref={dragRef}>
          <Icon.DragIndicator />
        </DragIndicator>
      </Container>

      {showMsg ? (
        <Grid container style={{ paddingTop: '50px' }}>
          <Grid item>
            <TextField
              id="outlined-basic-email"
              label="Type Something"
              fullWidth
              value={sendMsg}
              onChange={e => handleSendMsg(e.target.value)}
            />
          </Grid>
          <Grid align="right">
            <Fab size="small" color="primary" aria-label="add">
              {' '}
              <Button onClick={() => sendMssg(phoneNumber, sendMsg)}>
                <SendIcon />
              </Button>
            </Fab>
          </Grid>
        </Grid>
      ) : null}
    </Container>
  );
};

// Styles

const Container = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  top: 350px;
  left: 500px;
  min-width: 820px;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 999;
  padding: ${props => props.theme.spacing * 0.2}px 0
    ${props => props.theme.spacing * 0.2}px
    ${props => props.theme.spacing * 0.2}px;
  box-shadow: 0 0 10px ${props => props.theme.colors.gray3};
`;

const RoundedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 26px;
  border-radius: 13px;
  opacity: 0.8;
  margin: 0 ${props => props.theme.spacing * 0.3}px;

  svg {
    width: 25px;
    height: 15px;

    ${props =>
      !!props.color &&
      css`
        color: ${props.color};
      `}
  }

  ${props =>
    !!props.bgColor &&
    css`
      background-color: ${props.bgColor};
    `}
`;

const ToggleLabel = styled.div`
  font-size: ${props => props.theme.fontSize.medium};
  display: flex;
  justify-content: space-between;
  color: ${props => props.theme.colors.white};
  margin-left: ${props => props.theme.spacing * 0.4}px;
`;

const SelectBox = styled(Select)`
  color: ${props => props.theme.colors.gray2};
`;

const Label = styled.div`
  display: flex;
  align-items: center;
`;

const Text = styled.div`
  margin-left: ${props => props.theme.spacing * 0.4}px;
`;

const PhoneNumber = styled.input`
  width: 70px;
  border: none;
  outline: none;
  background-color: transparent;
  color: #969696;
  font-size: 10px;
  margin: 0 ${props => props.theme.spacing * 0.3}px;
`;

const VrLine = styled.div`
  width: 1px;
  height: 22px;
  background-color: #969696;
  margin: 0 ${props => props.theme.spacing * 0.3}px;
`;

const Notification = styled.div`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: ${props => props.theme.colors.red};
  margin: 0 ${props => props.theme.spacing * 0.3}px;

  svg {
    width: 25px;
    height: 20px;
    margin-right: ${props => props.theme.spacing * 0.1}px;
  }
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0 ${props => props.theme.spacing * 0.3}px;

  svg {
    color: ${props => props.theme.colors.gray2};
  }
`;

const DragIndicator = styled.div`
  display: flex;
  cursor: all-scroll;

  svg {
    width: 30px;
    height: 30px;
    margin-right: -${props => props.theme.spacing * 0.2}px;
    color: #969696;
  }
`;

const Flag = styled.img`
  width: 30px;
  object-fit: contain;
`;

export default DialControlBar;
