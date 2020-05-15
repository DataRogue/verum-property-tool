import React, { Component, RefObject } from 'react';
import logo from './logo.svg';
import './App.scss';
import { Block, EditProperty, ConvertTileMatrixToBlockMatrix, ConvertBlockMatrixToTileMatrix } from './edit-property';
import { SelectCountry, SelectRegion, SelectTraits, SelectSize } from './select-country';
import consts from "./consts.json";
import { Trait, CountryType, COUNTRY_DEFAULT, SubregionType, DataStructures, PlayerData, TileType, DataSerializer } from './data-structures';
import Files from 'react-files';




function generateDefaultBlock():Block{
  return new Block({tile:{
    name: "Empty",
    traits:[]
  }
  });
}

export type AppState = {
  stage:string,
  selectedCountry:string,
  selectedRegion:string,
  selectedTraits:string[]
  selectedGridSize:{x:number, y:number},
  tileMatrix:TileType[][][]
}


class App extends Component<{}, AppState> {
  data:DataSerializer;

  constructor(props:any){
    super(props);
    this.state = {
      stage: "landing",
      selectedCountry: "",
      selectedRegion: "",
      selectedTraits:[],
      selectedGridSize: {x:0, y:0},
      tileMatrix:[]
    }
    this.data = new DataSerializer();
  }


  UploadedJson(newJson:string){
    this.data.UpdateData(newJson);
    this.setState(this.data.getAppStateFromPlayerData());
  }

  countrySelectCallback(countryName:string){
    this.setState({selectedCountry:countryName});
  }

  regionSelectCallback(regionName:string){
    this.setState({selectedRegion:regionName});
  }

  traitSelectCallback(traitName:string){
    if(this.state.selectedTraits.find(x=>x === traitName)) this.setState({selectedTraits: this.state.selectedTraits.filter(x=>x!==traitName)});
    else this.state.selectedTraits.push(traitName);
    this.forceUpdate();
  }

  gridSelectCallback(grid:{x:number, y:number}){
    this.setState({selectedGridSize:grid});
  }

  blockUpdateCallback(blockMatrix:Block[][][]){
    this.setState({tileMatrix:ConvertBlockMatrixToTileMatrix(blockMatrix)});
  }

  nextClickCallback(){

    switch(this.state.stage){
      case 'country-select':
        if(this.state.selectedCountry !== "") this.setState({stage:"region-select"});
        else console.error(`No country selected`);
        break;
      case 'region-select':
        if(this.state.selectedRegion !== "") this.setState({stage:"trait-select"});
        break;
      case 'trait-select':
        this.setState({stage:'size-select'})
        break;
      case 'size-select':
          this.setState({stage:'edit'})
          break;
      default: 
        console.error(`Unsupported Stage State ${this.state.stage}`);
    }
  }

  render(){
    this.data.ConstructData(this.state);
    return (
      <div className="App">
        {
          this.state.stage !== "landing" ? <Header data={this.data.playerData}/> : null
        }
        {(() => {
        switch (this.state.stage) {
          case 'landing':
            return (
              <div className="row">
                <div className="col"><button onClick={()=>{this.setState({stage:"country-select"})}}>New Property</button></div>
                <div className="col"><FileInput UploadedJson={(newJson:any)=>this.UploadedJson(newJson)}></FileInput></div>
              </div>
            );
          case 'country-select':
            return (
            <div>
              <SelectCountry selectedCountry={this.state.selectedCountry} selectCountryCallback={(x:string)=>this.countrySelectCallback(x)}/>
            </div>
            );
          case 'region-select':
              return (
              <div>
                <SelectRegion selectedSubregion={this.state.selectedRegion} selectedCountry={this.state.selectedCountry} selectRegionCallback={(x:string)=>this.regionSelectCallback(x)} ></SelectRegion>
              </div>
              );
          case 'trait-select':
            let country:CountryType = consts.COUNTRIES.find(country => country.name === this.state.selectedCountry) as CountryType;
            let selectedRegion:SubregionType = DataStructures.GetSubregionByName(country, this.state.selectedRegion);
            let possibleTraits:Trait[] = DataStructures.GetTraitsFromNames(selectedRegion.traits);
            let selectedTraits:Trait[] = this.state.selectedTraits.map((x)=> possibleTraits.find(y=>y.name === x) as Trait);
            return (
              <SelectTraits selectedTraits={selectedTraits} possibleTraits={possibleTraits} countryName={country.name} selectTraitCallback={(x:string)=>this.traitSelectCallback(x)} baseMultiplier={selectedRegion} />
            );
          case 'size-select':{
            return(
              <SelectSize possibleGridSizes={consts.GRID_SIZES} selectedGridSize={this.state.selectedGridSize} gridSizeSelectCallback={(grid:{x:number, y:number})=>this.gridSelectCallback(grid)} />
            )
          }
          case 'edit':
            return <EditProperty data={this.data.playerData} blockUpdatedCallback={this.blockUpdateCallback.bind(this)}/>;
          default:
            return null;
        }
      })()}
      <hr/>
      <div className="row">
        <div className="col"><button>Back</button></div>
        <div className="col">
          {
            this.state.stage === "edit" ? <button onClick={()=>this.data.SerializeToJSONAnDownload()}>Download JSON</button> : <button onClick={()=>this.nextClickCallback()}>Next</button>
          }
        </div>
      </div>
      </div>
    );
  }

}

type HeaderState = {
  calculatedLandCost:number,
  calculatedGoldCost:number,
  calculatedTpCost:number
  multipliers:{
    dangerLevel:number,
    landCost:number,
    buildCost:number,
    tpValue:number
  }
}

class Header extends Component<{data:PlayerData}, HeaderState> {
  constructor(props:any){
    super(props);
    this.state = Header.calculateData({data:this.props.data});
  }


  static getDerivedStateFromProps(props:any, state:any){
    return Header.calculateData(props);
  }

  static calculateData(props:{data:PlayerData}){

    let finalMultipliers = {
      dangerLevel: 0,
      buildCost: 0,
      landCost: 0,
      tpValue: 0
    };

    if(props.data.countryName !== "" && props.data.regionName !== ""){
      let country = DataStructures.GetCountryDataByName(props.data.countryName);
      let baseRegionValues = DataStructures.GetSubregionByName(country, props.data.regionName);
      finalMultipliers = {...baseRegionValues};
    }
    
    DataStructures.GetTraitsFromNames(props.data.regionTraitsSelected).map((trait)=>{
      finalMultipliers.dangerLevel = DataStructures.ResolveValueModifier(finalMultipliers.dangerLevel, trait.dangerLevel);
      finalMultipliers.buildCost = DataStructures.ResolveValueModifier(finalMultipliers.buildCost, trait.buildCost);
      finalMultipliers.landCost = DataStructures.ResolveValueModifier(finalMultipliers.landCost, trait.landCost);
      finalMultipliers.tpValue = DataStructures.ResolveValueModifier(finalMultipliers.tpValue, trait.tpValue);
    });

    let landCost:number = 0;
    console.log(props.data.mapMatrix);
    if(props.data.mapMatrix.length > 0) landCost = props.data.mapMatrix.flat().length*consts.TILES.BASE_COSTS.LAND_COST*finalMultipliers.landCost;

    let buildCost:number = 0;
    let tpValue:number = 0;

    if(props.data.mapMatrix.length > 0) {
      let blockMatrix = ConvertTileMatrixToBlockMatrix(props.data.mapMatrix)
      blockMatrix.flat().flat().map((block)=>{
        let multipliers = DataStructures.GetQualityFromBlock(block);
        buildCost += DataStructures.ResolveValueModifier(block.tile.baseGpCost, multipliers.buildCost);
        tpValue += DataStructures.ResolveValueModifier(block.tile.baseTpCost, multipliers.tpValue);
      })
    }
    return {
      calculatedLandCost:landCost,
      calculatedGoldCost:buildCost,
      calculatedTpCost:tpValue,
      multipliers:finalMultipliers
    };
  }

  render(){
    return(
      <div className="row">
        <div className="col-2">
              <div>
                  <b>Total:</b> Land Cost - {this.state.calculatedLandCost} gp <br/>
                  Build Cost - {this.state.calculatedGoldCost} gp <br/>
                  TP Value -  {this.state.calculatedTpCost} tp <br/>
              </div>
        </div>
        <div className="col">
          <h3>
            {this.props.data.countryName || ""} - {this.props.data.regionName || ""}
          </h3>
          <h4>
            {this.props.data.regionTraitsSelected.join(", ")}
          </h4>
        </div>
        <div className="col-2">
              <div>
                  <b>Total:</b> Danger Level - {this.state.multipliers.dangerLevel} <br/>
                  Land Cost - {this.state.multipliers.landCost*100}% <br/>
                  Build Cost -  {this.state.multipliers.buildCost*100}% <br/>
                  TP Value -  {this.state.multipliers.tpValue*100}% <br/>
              </div>
        </div>
      </div>
    )
  }
}


class FileInput extends Component<{UploadedJson:Function}> {

  fileReader:FileReader;
  constructor(props:any) {
    super(props);
    this.state = {
      jsonFile: {}
  };
  
  this.fileReader = new FileReader();

  this.fileReader.onload = (event) => {
    const target = event.target;
    // or do whatever manipulation you want on JSON.parse(event.target.result) here.
    if(target){
      this.props.UploadedJson(target.result as string);
    }
    else{
      console.error("wat")
    }
  };
  }

  render() {

    return (
       <div className="files">
         <Files
          onChange={(file: Blob[]) => {
              // we choose readAsText() to load our file, and onload
              // event we rigister in this.fileReader would be triggered.
              this.fileReader.readAsText(file[0]);
          }}
         >
           Drop files here or click to upload
         </Files>
       </div>
    );
  }
}

export default App;


