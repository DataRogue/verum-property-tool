import { Component, Ref, createRef } from "react";
import React from "react";
import consts from "./consts.json";
import { DataStructures, Trait, SubregionType } from './data-structures';

import {ReactComponent as Badlands} from './maps/Map_Badlands.svg';
import {ReactComponent as Bloodwave} from './maps/Map_Bloodwave.svg';
import {ReactComponent as Daborak} from './maps/Map_Daborak.svg';
import {ReactComponent as Dolten} from './maps/Map_Dolten.svg';
import {ReactComponent as Khao} from './maps/Map_Khao.svg';
import {ReactComponent as Krazax} from './maps/Map_Krazax.svg';
import {ReactComponent as Majital} from './maps/Map_Majital.svg';
import {ReactComponent as Orde} from './maps/Map_Orde.svg';
import {ReactComponent as Rift} from './maps/Map_Rift.svg';
import {ReactComponent as Steton} from './maps/Map_Steton.svg';

export class SelectCountry extends Component<{selectedCountry:string, selectCountryCallback:Function}>{
    render(){
        return (
            <div className="row">
                <div className="col-2">
                    <h2>Select Country:</h2>
                    <ul>
                        {
                            consts.COUNTRIES.map((x, i)=>(
                                <li key={i} className={this.props.selectedCountry === x.name ? "active" : ""} onClick={()=>this.props.selectCountryCallback(x.name)}>{x.name}</li>
                            ))
                        }
                    </ul>
                </div>
                <div className="col">
                    <div className="map-container">
                        <Badlands className={this.props.selectedCountry === "Badlands" ? "map-highlight" : ""} />
                        <Bloodwave className={this.props.selectedCountry === "Bloodwave Bay" ? "map-highlight" : ""} />
                        <Orde className={this.props.selectedCountry === "Orde" ? "map-highlight" : ""}/>
                        <Dolten className={this.props.selectedCountry === "Dolten" ? "map-highlight" : ""} />
                        <Daborak className={this.props.selectedCountry === "Daborak" ? "map-highlight" : ""} />
                        <Khao className={this.props.selectedCountry === "Khao (Country)" ? "map-highlight" : ""} />
                        <Krazax className={this.props.selectedCountry === "Krazax" ? "map-highlight" : ""} />
                        <Majital className={this.props.selectedCountry === "Majital" ? "map-highlight" : ""} />
                        <Orde className={this.props.selectedCountry === "Orde" ? "map-highlight" : ""} />
                        <Rift className={this.props.selectedCountry === "Rift" ? "map-highlight" : ""} />
                        <Steton className={this.props.selectedCountry === "Steton" ? "map-highlight" : ""} />
                    </div>
                </div>
            </div>
        )
    }
}

export class SelectRegion extends Component<{selectedCountry:string, selectRegionCallback:Function, selectedSubregion:string}>{
    getCorrectCountryView(){
        switch(this.props.selectedCountry){
            case "Badlands": return <Badlands />;
            case "Bloodwave Bay": return <Bloodwave />;
            case "Orde": return <Orde />;
            case "Dolten": return <Dolten />;
            case "Daborak": return <Daborak />;
            case "Khao (Country)": return <Khao />;
            case "Krazax": return <Krazax />;
            case "Majital": return <Majital />;
            case "Orde": return <Orde />;
            case "Rift": return <Rift />;
            case "Steton": return <Steton />;
        }
        return <div/>
    }

    render(){
        const country = consts.COUNTRIES.find(country => country.name === this.props.selectedCountry);
        const regions = country?.regions || [];

        
        let defaultSubregion = {
            "name": "",
            "dangerLevel": 0,
            "landCost": 0,
            "buildCost": 0,
            "tpValue": 0
        };

        if(this.props.selectedSubregion !== ""){
            defaultSubregion = regions.flatMap(x=> x.subregions).find(y=>y.name === this.props.selectedSubregion) || defaultSubregion;
        }

        
        return (
            <div className="row">
                <div className="col-2">
                    <h2>Select Region:</h2>
                    {
                        regions.map((region, i)=>(
                            <div key={i} className="row">
                                <div className="col"> {region.name} </div>
                                <div className="col">
                                    <ul>
                                        {region.subregions.map((subregion, j) => <li key={j} className={this.props.selectedSubregion === subregion.name ? "active" : ""} onClick={()=>this.props.selectRegionCallback(subregion.name)}>{subregion.name}</li>)}
                                    </ul>
                                </div>

                            </div>
                        ))
                    }
                </div>
                <div className="col">
                    {this.getCorrectCountryView()}
                </div>
            </div>
        )
    }
}

export class SelectTraits extends Component<{possibleTraits:Trait[], selectedTraits:Trait[], baseMultiplier:SubregionType, countryName:string, selectTraitCallback:Function}, {hoveredSubregion?:Trait}>{
    constructor(props:any){
        super(props);
        this.state = {};
    }
    onHover(name:Trait){
        this.setState({
            hoveredSubregion:name
        })
    }
    render(){
        let multipliers = {
            dangerLevel: this.props.baseMultiplier.dangerLevel,
            landCost: this.props.baseMultiplier.landCost,
            buildCost: this.props.baseMultiplier.buildCost,
            tpValue: this.props.baseMultiplier.tpValue
        };
        this.props.selectedTraits.forEach(x =>
        {
            multipliers.dangerLevel = DataStructures.ResolveValueModifier(multipliers.dangerLevel, x.dangerLevel);
            multipliers.landCost = DataStructures.ResolveValueModifier(multipliers.landCost, x.landCost);
            multipliers.buildCost = DataStructures.ResolveValueModifier(multipliers.buildCost, x.buildCost);
            multipliers.tpValue = DataStructures.ResolveValueModifier(multipliers.tpValue, x.tpValue);
        });
        

        return (
            <div className="row">
                <div className="col-5">
                    <h2>{this.props.countryName} Traits:</h2>
                    <ul>
                    {
                        //To-do, list render all the possible traits
                        this.props.possibleTraits.map((trait, i) => <li key={i} onMouseEnter={()=>this.onHover(trait)} className={this.props.selectedTraits.find(x=>x.name===trait.name) ? "active" : ""} onClick={(x=>this.props.selectTraitCallback(trait.name))}>{trait.name}</li>)
                    }
                    </ul>
                </div>
                <div className="col">
                    {
                        this.state.hoveredSubregion ?
                        <div className="col"> 
                            <h3>{this.state.hoveredSubregion.name}</h3>
                            <p>{this.state.hoveredSubregion.description}</p>
                        </div>
                        :null
                    }
                </div>
            </div>
        )
    }
}

export class SelectSize extends Component<{possibleGridSizes:{x:number, y:number}[], selectedGridSize:{x:number, y:number}, gridSizeSelectCallback:Function}>{
    private table = createRef<HTMLTableElement>();
    constructor(props:any){
        super(props);
        window.addEventListener('resize', ()=>this.forceUpdate())
    }

    componentDidMount(){
        this.forceUpdate();
    }

    render(){
        let arrX = new Array<number>(this.props.selectedGridSize.x);
        let arrY = new Array<number>(this.props.selectedGridSize.y);
        arrX.fill(0);
        arrY.fill(0);
        return (
            <div className="row">
                <div className="col-3">
                    <ul>
                        {
                            this.props.possibleGridSizes.map((grid, i)=>{
                                return <li key={i} className={this.props.selectedGridSize === grid ? "active" : ""} onClick={()=>this.props.gridSizeSelectCallback(grid)} >{grid.x} x {grid.y}</li>
                            })
                        }
                    </ul>
                </div>
                <div className="col">
                <table ref={this.table} className="block-matrix-table">
                        <tbody>
                        {
                            arrY.map((yRow, i) =>(
                                <tr key={i}>
                                {
                                    arrX.map((block, j) => (
                                        <td key={j} style={{width:(this.table.current?.clientWidth ||  0)/arrX.length, height:(this.table.current?.clientWidth || 0)/arrX.length}}/>
                                    ))
                                }
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                <div className="col-3"></div>
            </div>
        )
    }
}