import { Config } from "app/config";
import React, { FC } from "react";
import { Connector } from 'mqtt-react-hooks';

/**
 * Component properties
 */
interface Props {
}

/**
 * MQTT server
 */
interface MqttServer {
  host: string;
  port: number;
  protocol: 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs';
};

/**
 * MQTT connector provider component
 *
 * @param props component properties
 */
const MqttConnector: FC<Props> = ({ children }) => {
  const { urls, username, password } = Config.get().mqtt;

  /**
   * Parses MQTT server URL
   * 
   * @param url MQTT server URL
   * @returns parsed MQTT server
   */
  const parseServer = (url: string): MqttServer | null => {
    const regex = /([a-zA-Z]{1,}):\/\/([a-zA-Z0-9-.]{1,}):([1-9]{1,})/gm;
    const match = regex.exec(url);
    if (!match || match.length !== 4) {
      return null;
    }

    const protocol = match[1];
    const host = match[2];
    const port = parseInt(match[3]);

    return {
      port: port,
      host: host,
      protocol: protocol as 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs'
    };
  }
  
  const servers = urls
    .map(url => parseServer(url))
    .filter(server => server !== null) as MqttServer[];

  const options = {
    username: username,
    password: password,
    servers: servers
  };
  
  return (
    <Connector
      brokerUrl={ "" }
      options={ options }
      parserMethod={ message => JSON.parse(message) }
    >
      { children }
    </Connector>
  );
};

export default MqttConnector;