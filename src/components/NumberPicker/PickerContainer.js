import React, { Component } from "react";
import shallowEqualArrays from "shallow-equal/arrays";
import { string, object } from "prop-types";
import Media from "react-media";
import noScroll from "no-scroll";

import lottoData from "./pickerLottoData";
import NumberPicker from "./NumberPicker";
import NumberPickerMobile from "./NumberPickerMobile";
import { mobXConnect } from "../../tools/toolFunctions";

class PickerContainer extends Component {
  state = {
      maxNumber: lottoData[this.props.lotto].maxNumber,
	  maxBonus: lottoData[this.props.lotto].maxBonus,
      minNumber: lottoData[this.props.lotto].minNumber,	  
      minBonus: lottoData[this.props.lotto].minBonus,	  
	  numbersAmount: lottoData[this.props.lotto].numbersAmount,
	  bonusAmount: lottoData[this.props.lotto].bonusAmount,
	  bonusName: lottoData[this.props.lotto].bonusName,
	  ballsTheme: lottoData[this.props.lotto].ballsTheme,
	  includeZeroBonusNumber: lottoData[this.props.lotto].includeZeroBonusNumber,	  
	  quickPickDelay: 150,
	  isMobileModalOpen: false
  };

  toggleNum = num => {
	  const {numbersAmount} = this.state;
	  const {addNumber, removeNumber} = this.props.pickerStore;
	  let pickedNums = this.props.pickerStore.ticketsData[0].pickedNums.slice();
      if (pickedNums.indexOf(num) !== -1) {
          return removeNumber(num);
      }

      if (pickedNums.length === numbersAmount) {
          return;
      }

      addNumber(num);
  };

  toggleBonus = bonus => {
	  const {bonusAmount} = this.state;
	  const {addBonus, removeBonus} = this.props.pickerStore;
      let pickedBonus = this.props.pickerStore.ticketsData[0].pickedBonus.slice();
      if (pickedBonus.indexOf(bonus) !== -1) {
          return removeBonus(bonus);
      }

      if (pickedBonus.length === bonusAmount) {
          return;
      }

      addBonus(bonus);
  };

  clearNums = () => {
	  const {clearTicket} = this.props.pickerStore;
	  clearTicket();
  };

  genNumbersHeader = () => {
	  const {numbersAmount} = this.state;
	  const {pickedNums} = this.props.pickerStore.ticketsData[0];

      if (pickedNums.length === numbersAmount) {
          return "Line completed";
      } else {
          const diff = numbersAmount - pickedNums.length;
          if (diff === 1) {
              return "Select 1 number";
          }
          return `Select ${diff} numbers`;
      }
  };

  genNumbersMobileHeader = () => {
	  const numCircles = [];
	  const {numbersAmount, bonusAmount} = this.state;
	  const {pickedNums, pickedBonus} = this.props.pickerStore.ticketsData[0];
  
      for(let x = 1; x <= numbersAmount; x++) {
          const number = pickedNums.length >= x && pickedNums[x-1];
          const classString = `picker-mob_nums_head_circle -num-circle${number ? " -filled" : ""}`;
          numCircles.push(<div key={`n-${x}`} className={classString}>{number}</div>)
      }
  
      const bonusCircles = [];
  
      for(let x = 1; x <= bonusAmount; x++) {
		  const number = pickedBonus.length >= x && pickedBonus[x-1];
          const classString = `picker-mob_nums_head_circle -bonus-circle${number ? " -filled" : ""}`;
          bonusCircles.push(<div key={`b-${x}`} className={classString}>{number}</div>)
	  }
	  
	  return numCircles.concat(bonusCircles);
  };

  genBonusHeader = () => {
	  const {bonusAmount, bonusName} = this.state;
	  const {pickedBonus} = this.props.pickerStore.ticketsData[0];	  
	  
      if (pickedBonus.length === bonusAmount) {
          return "All done here!";
      } else {
          const diff = bonusAmount - pickedBonus.length;
          if (diff === 1) {
              return `Select 1 ${bonusName}!`;
          }
          return `Select ${diff} ${bonusName}s!`;
      }	
  };

  genRandomNumber = () => {
      const {numbersAmount} = this.state;	  
	  let { maxNumber, quickPickDelay, minNumber } = this.state;
	  let {addNumber} = this.props.pickerStore;
	  let pickedNums = this.props.pickerStore.ticketsData[0].pickedNums.slice();
	  
	   if (pickedNums.length == numbersAmount) {
		   return this.genRandomBonus();
	   }

      let ranNumber = Math.floor(Math.random() * maxNumber) + minNumber;
      if (pickedNums.indexOf(ranNumber) !== -1) {
          return this.genRandomNumber();
      } else {
			  addNumber(ranNumber);
          setTimeout(() => {
              this.genRandomNumber();
          }, quickPickDelay);
      }
  };

  genRandomBonus = () => {
	  let { maxBonus, bonusAmount, quickPickDelay, minBonus } = this.state;
	  let {addBonus} = this.props.pickerStore;	  
	  let {pickedBonus} = this.props.pickerStore.ticketsData[0];	  
	  let pickedBonuses = pickedBonus.slice();
	  
	  if (pickedBonuses.length === bonusAmount) {
		  return;
	  }

      let ranBonus = Math.floor(Math.random() * maxBonus) + minBonus;
      if (pickedBonuses.indexOf(ranBonus) !== -1) {
          return this.genRandomBonus();
      } else {
			  addBonus(ranBonus);
          setTimeout(() => {
              this.genRandomBonus();
          }, quickPickDelay);
      }
  };

  quickPick = () => {
	  const {clearTicket} = this.props.pickerStore;

      clearTicket(0, () => {
          this.genRandomNumber();
      });
  };

  generateNumbers = maxNumber => {
      const { minNumber} = this.state;	  
      let nums = [];
      const pickedNums = this.props.pickerStore.ticketsData[0].pickedNums;
      for (let num = minNumber; num <= maxNumber; num++) {
          const picked = pickedNums.indexOf(num) !== -1;
          const numHtml = (
              <div
                  key={num}
                  className={`picker_nums_num ${picked ? "-picked" : ""}`}
                  onClick={() => this.toggleNum(num)}
              >
                  {num}
              </div>
          );
          nums.push(numHtml);
      }
      return nums;
  };

  generateBonusNums = maxBonus => {
	  const { minBonus} = this.state;
	  let bonuses = [];	  
      const pickedBonus = this.props.pickerStore.ticketsData[0].pickedBonus;
      for (let bonus = minBonus; bonus <= maxBonus; bonus++) {
          const picked = pickedBonus.indexOf(bonus) !== -1;
          const numHtml = (
              <div
                  key={bonus}
                  className={`picker_bonus_num ${picked ? "-picked" : ""}`}
                  onClick={() => this.toggleBonus(bonus)}
              >
                  {bonus}
              </div>
          );
          bonuses.push(numHtml);
      }
      return bonuses;
  };

  openMobileModal = () => {
	  noScroll.on();
	  this.setState({
          isMobileModalOpen: true
	  })
  };

  closeMobileModal = () => {
	  noScroll.off();
	  this.setState({
          isMobileModalOpen: false
	  })
  }

  pickerMethods = {
      quickPick: this.quickPick,
      clearNums: this.clearNums,
      genNumbersHeader: this.genNumbersHeader,
      generateNumbers: () => this.generateNumbers(this.state.maxNumber),
      genBonusHeader: this.genBonusHeader,
      generateBonusNums: () => this.generateBonusNums(this.state.maxBonus)
  };

  pickerMobileMethods = {
      genNumbersMobileHeader: this.genNumbersMobileHeader,
      openMobileModal: this.openMobileModal,
      closeMobileModal: this.closeMobileModal	
  }

  render() {
	  const { numbersAmount, bonusAmount} = this.state;
	  const {pickedNums, pickedBonus} = this.props.pickerStore.ticketsData[0];

      const isDone = pickedNums.length === numbersAmount && pickedBonus.length === bonusAmount;
	
      return (
          <Media query="(min-width: 768px)">
              {matcher =>
                  matcher ? (
                      <NumberPicker
                          pickerMethods={this.pickerMethods}
                          pickedNums={this.state.pickedNums}
						  pickedBonus={this.state.pickedBonus}
						  numbersAmount={this.state.numbersAmount}
						  bonusAmount={this.state.bonusAmount}
						  bonusName={this.state.bonusName}
						  done={isDone}
						  numberOfTickets={4}
                      />
                  ) : (
                      <NumberPickerMobile
                          pickerMethods={this.pickerMethods}
                          pickerMobileMethods={this.pickerMobileMethods}
                          pickedNums={this.state.pickedNums}
						  pickedBonus={this.state.pickedBonus}
						  numbersAmount={this.state.numbersAmount}
						  bonusAmount={this.state.bonusAmount}
						  maxNumber={this.state.maxNumber}						  						  
						  maxBonus={this.state.maxBonus}
						  ballsTheme={this.state.ballsTheme}
						  modalOpen={this.state.isMobileModalOpen}
						  done={isDone}						  
                      />
                  )
              }
          </Media>
      );
  }
}

PickerContainer.propTypes = {
	lotto: string.isRequired,
	pickerStore: object.isRequired
};

export default mobXConnect("pickerStore")(PickerContainer);
