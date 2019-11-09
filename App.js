import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';


export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.front,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    this.snapPhoto();
    this.timer = setInterval(() => {
      this.snapPhoto();
      console.log("HI");
    }, 500);
  }

  async snapPhoto() {
    String.prototype.replaceAll = function (search, replacement) {
      var target = this;
      return target.replace(new RegExp(search, 'g'), replacement);
    };

    var dark = false; // replace with api value

    console.log('Button Pressed');
    if (this.camera) {
      console.log('Taking photo');
      const options = {
        quality: 0, base64: true, fixOrientation: true,
        exif: true
      };
      await this.camera.takePictureAsync(options).then(photo => {
        photo.exif.Orientation = 1;
        var b64 = photo.base64.replaceAll("/", "-");
        //console.log(b64);

        console.log('sending request');
        fetch("http://10.36.29.210:4200/img/" + b64).then(async (response) => {
          //console.log("HI");
          //console.log(response.json());
          response.json().then(async (body) => {
            //console.log('got respnse');
            //console.log(data);
            let { errors, data } = body;
            data = parseFloat(data);
            console.log(`Got brightness: ${data}`);
            if (data <= 100) {
              dark = true;
            }
            else {
              dark = false;
            }

            if (dark) {
              console.log("hi");
              const soundObject = new Audio.Sound();
              try {
                await soundObject.loadAsync(require('./assets/scream.mp3'));
                await soundObject.playAsync()
                console.log("playing");
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
                console.log(error);
              }
            }
          })
        })
      });
    }
  }




  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} ref={(ref) => { this.camera = ref }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  console.log("press button");
                  this.snapPhoto();
                }}>
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Take </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          <Text>

          </Text>
        </View>
      );
    }
  }
}
