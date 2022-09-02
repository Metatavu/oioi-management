import { Config } from "app/config";
import React, { FC } from "react";
import { Connector } from 'mqtt-react-hooks';

/**
 * Component properties
 */
interface Props {
}

/**
 * MQTT connector provider component
 *
 * @param props component properties
 */
const MqttConnector: FC<Props> = ({ children }) => {
  const { brokerUrl, username, password } = Config.get().mqtt;
  
  const options = {
    username: username,
    password: password
  };
  
  return (
    <Connector
      brokerUrl={ brokerUrl }
      options={ options }
      parserMethod={ message => JSON.parse(message) }
    >
      { children }
    </Connector>
  );
};

export default MqttConnector;