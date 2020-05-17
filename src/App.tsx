import React, { Component, RefObject } from 'react';
import logo from './logo.svg';
import './App.scss';
import { Block, EditProperty, ConvertTileMatrixToBlockMatrix, ConvertBlockMatrixToTileMatrix } from './edit-property';
import { SelectCountry, SelectRegion, SelectTraits, SelectSize } from './select-country';
import consts from "./consts.json";
import { Trait, CountryType, COUNTRY_DEFAULT, SubregionType, DataStructures, PlayerData, TileType, DataSerializer, ValueModifierType } from './data-structures';
import Files from 'react-files';

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

  canGoNext(){
    switch(this.state.stage){
      case 'country-select':
        if(this.state.selectedCountry !== "") return true;
        return false
      case 'region-select':
        if(this.state.selectedRegion !== "") return true;
        return false;
      case 'size-select':
        if(this.state.selectedGridSize.x > 0) return true;
        return false;
      default: 
        return true
    }
  }

  render(){
    this.data.ConstructData(this.state);
    return (
      <div className="App">
        <div className="row title fixed-top">
          <div className="col">
            <h2>Verum Property Tool</h2>
          </div>
        </div>
        <div className="container-fluid main-content">
          {
            this.state.stage !== "landing" ? <Header data={this.data.playerData}/> : null
          }
          {(() => {
          switch (this.state.stage) {
            case 'landing':
              return (
                <div className="row">
                  <br/>
                  <div className="col">
                    <div className="col-12"><h3>Create A New Property?</h3></div>
                    <div className="col-12"><button type="button" className="btn btn-outline-primary btn-lg btn-block new-property-button" onClick={()=>{this.setState({stage:"country-select"})}}>New Property</button></div>
                  </div>
                  <div className="col">
                    <div className="col-12"><h3>Edit An Existing Property</h3></div>
                    <div className="col-12"><FileInput UploadedJson={(newJson:any)=>this.UploadedJson(newJson)}></FileInput></div>
                  </div>
                  <div className="col-12">
                    <br/>
                    <h5>How do I...</h5>
                    <h6>To make a new property?</h6>
                    <p>
                      Hit Create A New Property and follow the step-by-step instructions to purchase land and build a property on top of it. You will select your country, region, any or no traits in that region, property size, and you're free to fill in the grid with the tiles you want.
                    </p>
                    <h6>Save/Load?</h6>
                    <p>
                      When you're done. Hit the download JSON button. Anytime you want to look or work on your property again just open up the tool and drag it into the right-side box
                    </p>
                    <h6>Use it in MapTools?</h6>
                    <p>
                      You can also screen cap the map (or download an automatically sized image) and use it as a map in MapTools to roleplay in. Each square translates to a 5ft square in DnD.
                    </p>
                    <h6>What is TP?</h6>
                    <p>
                      Increasing your TP (Tier Points) by building in fancier areas and using more expensive tiles will increase your building's tier (1-10). Kind of like Prestige, but for buildings. The higher your tier is the more gold your building can generate. Additional benefits (if any) are TBD but we're aiming for something that resembles weaker non-stacking versions of some faction benefits to be voted on by the community.
                    </p>
                    <hr/>
                    By Dmitri "SweetBro" Roujan and Jonathan "Dr Imp" Brimble
                    <p>
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                        <img src="https://licensebuttons.net/l/by-sa/3.0/88x31.png"></img>
                      </a>
                    </p>
                   
                  </div>
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
        
        </div>
        <div className={`fixed-bottom container-fluid footer ${this.state.stage === 'landing'? 'hidden' : ''}`}>
          <div className="row">
            {
              //<div className="col"><button>Back</button></div>
            }
            <div className="col">
              {
                this.state.stage === "edit" ? 
                <button className="btn btn-outline-dark" onClick={()=>this.data.SerializeToJSONAnDownload()}>Download JSON</button> : 
                <button className="btn btn-outline-dark" disabled={!this.canGoNext()} onClick={()=>this.nextClickCallback()}><i className="fas fa-arrow-right"></i></button>
              }
            </div>
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
      dangerLevel: 1,
      buildCost: 1,
      landCost: 1,
      tpValue: 1
    };

    
    DataStructures.GetTraitsFromNames(props.data.regionTraitsSelected).map((trait)=>{
      finalMultipliers.dangerLevel = DataStructures.ResolveValueModifier(finalMultipliers.dangerLevel, trait.dangerLevel);
      finalMultipliers.buildCost = DataStructures.ResolveValueModifier(finalMultipliers.buildCost, trait.buildCost);
      finalMultipliers.landCost = DataStructures.ResolveValueModifier(finalMultipliers.landCost, trait.landCost);
      finalMultipliers.tpValue = DataStructures.ResolveValueModifier(finalMultipliers.tpValue, trait.tpValue);
    });

    if(props.data.countryName !== "" && props.data.regionName !== ""){
      let country = DataStructures.GetCountryDataByName(props.data.countryName);
      let baseRegionValues = DataStructures.GetSubregionByName(country, props.data.regionName);
      finalMultipliers.dangerLevel = baseRegionValues.dangerLevel * finalMultipliers.dangerLevel ;
      finalMultipliers.buildCost = baseRegionValues.buildCost * finalMultipliers.buildCost ;
      finalMultipliers.landCost = baseRegionValues.landCost * finalMultipliers.landCost ;
      finalMultipliers.tpValue = baseRegionValues.tpValue * finalMultipliers.tpValue ;
    }

    let landCost:number = 0;
    if(props.data.mapMatrix.length > 0) landCost = props.data.mapMatrix.flat().length*consts.TILES.BASE_COSTS.LAND_COST*finalMultipliers.landCost;

    let buildCost:number = 0;
    let tpValue:number = 0;

    if(props.data.mapMatrix.length > 0) {
      let blockMatrix = ConvertTileMatrixToBlockMatrix(props.data.mapMatrix)
      blockMatrix.flat().flat().map((block)=>{

        let multipliers = {
          buildCost: { type: "MULT", value: 1 } as ValueModifierType,
          tpValue: { type: "MULT", value: 1 } as ValueModifierType
        }

        if(block.trait){
          multipliers = block.trait;
        }

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
      <div className="header row">
        <div className="col-3">
          <h5>Total Cost Information</h5>
          <div>
              Land Cost - {Math.round(this.state.calculatedLandCost)} gp <br/>
              Build Cost - {Math.round(this.state.calculatedGoldCost)} gp <br/>
              TP Value -  {Math.round(this.state.calculatedTpCost)} tp <br/>
          </div>
        </div>
        <div className="col">
          <h3>
            {this.props.data.countryName || ""} {this.props.data.regionName ? " - "+this.props.data.regionName : ""}
          </h3>
          <h4>
            {this.props.data.regionTraitsSelected.join(", ")}
          </h4>
        </div>
        <div className="col-3">
          <h5>Current Multipliers</h5>
          <div>
              Danger Level - {Math.round(this.state.multipliers.dangerLevel)} <br/>
              Land Cost - {Math.round(this.state.multipliers.landCost*100)}% <br/>
              Build Cost -  {Math.round(this.state.multipliers.buildCost*100)}% <br/>
              TP Value -  {Math.round(this.state.multipliers.tpValue*100)}% <br/>
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
           <button className="drag-file-container btn btn-outline-secondary btn-lg btn-block">Click or Drag N' Drop To Upload</button>
         </Files>
       </div>
    );
  }
}

export default App;


