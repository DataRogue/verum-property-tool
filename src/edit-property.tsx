import React, { Component, createRef } from 'react'; // let's also import Component
import './edit-property.scss';

import { PlayerData, TileType } from './data-structures';

const TILE_INDOOR_CONSTS:TileConstType[] = [
    {
        tileType: "empty",
        tileDisplayName: "Empty",
        color: "white",
        baseTpCost: 0,
        baseGpCost: 0
    },
    {
        tileType: "cheap",
        tileDisplayName: "Cheap",
        color: "#4e342e",
        baseTpCost: 2,
        baseGpCost: 10
    },
    {
        tileType: "generic",
        tileDisplayName: "Generic",
        color: "#c62828",
        baseTpCost: 8,
        baseGpCost: 30
    },
    {
        tileType: "expensive",
        tileDisplayName: "Expensive",
        color: "#d84315",
        baseTpCost: 30,
        baseGpCost: 100
    },
    {
        tileType: "very-expensive",
        tileDisplayName: "Very Expensive",
        color: "#f9a825",
        baseTpCost: 100,
        baseGpCost: 300
    }
]

type TileConstType = {
    tileType: string;
    tileDisplayName: string;
    color: string;
    baseTpCost: number;
    baseGpCost: number;
}

export class Block {
    tile:TileConstType;
    traits:string[] = [];
    constructor(data:{tile?:TileType, const?:TileConstType}){
        if(data.tile){
            let t = data.tile;
            this.tile = TILE_INDOOR_CONSTS.find(x=>x.tileDisplayName === t.name) as TileConstType;
            this.traits = t.traits;
        } else if(data.const) {
            this.tile = data.const;
        }
        else {
            throw console.error("Need either 'tile' or 'const' defined");
        }
    }
    

    ConvertToTileType():TileType{
        return {
            name: this.tile.tileDisplayName,
            traits: this.traits
        }
    }
}

type PropertyState = {
    blockMatrix:Block[][][],
    selectedTileType:TileConstType,
    currentLevel: number,
    currentlySelectedTraits: string[]
}

export function ConvertTileMatrixToBlockMatrix(mapMatrix:TileType[][][]):Block[][][]{
    return mapMatrix.map(x=>x.map(y=>y.map(z=>new Block({tile:z}))));
}

export function ConvertBlockMatrixToTileMatrix(mapMatrix:Block[][][]):TileType[][][]{
    return mapMatrix.map(x=>x.map(y=>y.map(z=>z.ConvertToTileType())));
}

export class EditProperty extends Component<{data:PlayerData, blockUpdatedCallback:Function}, PropertyState> {
    constructor(props: any) {
      super(props)
      this.state = {
          blockMatrix : ConvertTileMatrixToBlockMatrix(props.data.mapMatrix),
          selectedTileType: TILE_INDOOR_CONSTS[0],
          currentLevel: 0,
          currentlySelectedTraits: []
      }
    }

    private table = createRef<HTMLTableElement>();

    

    TileSelected(tile:TileConstType){
        this.setState({
            selectedTileType:tile
        })
    }


    createTileTypeLegendsView(tile:TileConstType, i:number) {
        return(
            <li onClick={()=>this.TileSelected(tile)} key={i} className={`tile-${tile.tileType} ${(tile.tileType === this.state.selectedTileType.tileType ? 'active' : '')}`}>
                {tile.tileDisplayName} <span className="color-block" style={{backgroundColor:tile.color}}></span>
            </li>
        )
    }

    updateTileAtCoords(coords:{x:number, y:number}){
        const block:Block = new Block({const:this.state.selectedTileType});
        this.state.blockMatrix[coords.x][coords.y][this.state.currentLevel] = block;
        this.props.blockUpdatedCallback(this.state.blockMatrix);
        this.forceUpdate();
    }

    render(){
        let flattenedBlocks: Block[] = this.state.blockMatrix.flat().flat();
        //let calculatedTpCost: number = flattenedBlocks.map(block=>block.tile.baseTpCost).reduce((accumulator, currentValue) => accumulator + currentValue);
        //let calculatedGoldCost: number = flattenedBlocks.map(block=>block.tile.baseGpCost).reduce((accumulator, currentValue) => accumulator + currentValue);

        return (
            <div className="row">
                <div className="col-2">
                    <h2>Blocks:</h2>
                    <h3>Indoor:</h3>
                        <ul>
                        {
                            TILE_INDOOR_CONSTS.map((tile, i) => this.createTileTypeLegendsView(tile, i))
                        }
                        </ul>
                    <br/>

                    <h3>Outdoor:</h3>
                    <div>Field <span className="tile tile-field"></span></div>
                    <div>Decorated <span className="tile tile-decorated"></span></div>
                    <div>Well Decorated <span className="tile tile-well-decorated"></span></div>
                    <div>Very Decorated <span className="tile tile-very-decorated"></span></div>

                    <h3>Special:</h3>
                    <div>Reinforced Wooden Wall <span className="tile tile-wooden-wall"></span></div>
                    <div>Reinforced Stone Wall <span className="tile tile-stone-wall"></span></div>
                    <div>Escape Tunnel <span className="tile tile-escape-tunnel"></span></div>
                </div>
                <div className="col-7">
                    <table ref={this.table} className="block-matrix-table">
                        <tbody>
                        {
                            this.state.blockMatrix.map((yRow, i) =>(
                                <tr key={i}>
                                {
                                    yRow.map((block, j) => (
                                        <BlockView key={j} blockData={block[this.state.currentLevel]} coords={{x:i,y:j}}
                                         clickCallback={this.updateTileAtCoords.bind(this)}
                                         height={(this.table.current?.clientWidth || 0)/this.state.blockMatrix.length}
                                         />
                                    ))
                                }
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                     
                </div>
            </div>
        );
    }
  }

  class BlockView extends Component<{blockData:Block, clickCallback:Function, coords:{x:number, y:number}, height:number}> {
    constructor(props: any) {
      super(props)
    }

    render(){
        return (
            <td onClick={()=>this.props.clickCallback(this.props.coords)}
                style={{backgroundColor:this.props.blockData.tile.color, height:this.props.height}}
            >
                </td>
        )
    }

}