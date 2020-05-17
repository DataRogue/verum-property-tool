![https://creativecommons.org/licenses/by-sa/4.0/](https://licensebuttons.net/l/by-sa/3.0/88x31.png)

## What did you make this project with?
TypeScript, React, SASS, and a few other packages. 

## ELI5 What the license for this means?
I'm releasing this project under the Attribution-ShareAlike 4.0 International license. Which in short means you can use it for whatever you want including commercial purposes, so long as: myself (SweetBro) and Dr. Imp are properly credited in a visible location AND any derivatives of this codebase follow the same license. Meaning you can't make a 1 line edit and strip our names from the credits nor are you allowed to make a few changes and then sell the tool to another living world.

## How do I run this thing locally?
You're going to need to install node and npm. Then in a terminal window run then `npm start` command.

## How do I deploy this thing?
Clone the github repo. Change the `homepage` field in `package.json` to match your github pages domain. Then run `npm run deploy` from your terminal.

## How hard is it to make changes to the values?
All data sits in the following files: `consts.json`, `traits.json`, and `qualities.json.` These can be edited with any text editor and I recommend using something `https://jsoneditoronline.org/` to make sure you didn't goof up the formatting. Almost all of the data inputs for the demo have been done by Dr. Imp as a demonstration that no special technical skills are required to do this.

Currently the only thing that isn't data-driven are the maps which is mostly due to time-constraints.

## Cool so everything is data-driven and we can change basically everything, is there anything we shouldn't change?
Don't changes names. For the demo, they're being used as identifiers. Also if you want to add a new trait/quality you need to first add it to its respective json file and then add it to list of traits/qualities that each subregions/tile has access to.

## How does loading/saving works?
This is an entirely clientside tool. User property gets saved to a JSON that is downloaded on the user hard drive. When they want to view it again, they can load it up in the app via the drag/drop interface.

## How do we prevent cheating?
The tool is written in such a way as such that actual numbers never get saved into the user's JSON and are instead calculated from the tool's constants every time. Meaning that although the user can modify their files manually at-will, it is impossible to cheat and gain an unfair advantage without a GM covering for them. The only possible exception is changing their region after property creation, but this is so minor and so easy to spot it is a non-issue. 

## XYZ feature is missing!
Not a question. Some features I cut for time sake simply because I viewed them as lower priority than other things. Nothing in the project's original spec was uniquely technically challenging, but some were not really worth the time spent to result gained in a demo environment. 

## I'm a programmer and I think Line X or Y is shitcode!
Also not a question. Cool, so do I. I threw this tool togeather in ~23 hours of work in my spare time. You're more than welcome to fork improve this.

## SweetBro we love you!
![](https://media1.tenor.com/images/f77b4d5d1bdb39680d6eede56d0ac04e/tenor.gif?itemid=9058665)