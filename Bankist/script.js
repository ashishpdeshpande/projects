"use strict";

// Data
const account1 = {
  owner: "Tim David",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, 
  pin: 1111,

  movementsDates: [
    "2024-11-18T21:31:17.178Z",
    "2024-12-23T07:42:02.383Z",
    "2025-01-08T09:15:04.904Z",
    "2025-01-11T10:17:24.185Z",
    "2025-01-27T14:11:59.604Z",
    "2025-02-17T17:01:17.194Z",
    "2025-02-24T20:36:17.929Z",
    "2025-02-25T10:51:36.790Z",
  ],

  currency: "INR",
  locale: "en-IN",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],

 currency: "INR",
  locale: "en-IN",
};



const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

//////////////////////////////////////////////////////////////////////
// displaying movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const combineMovsDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sort) combineMovsDates.sort((a, b) => a.movement - b.movement);

  combineMovsDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? "deposit" : "withdrawal";

    const date = new Date(movementDate);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMovs = formatCur(movement, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i} ${type}</div>
         <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovs}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//////////////////////////////////////////////////
// calculate and display balance

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//////////////////////////////////////////////////

const displaySummary = function (acc) {
  const totalDeposit = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const totalWithdrawal = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const intrest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int > 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = formatCur(totalDeposit, acc.locale, acc.currency);
  labelSumOut.textContent = formatCur(
    Math.abs(totalWithdrawal),
    acc.locale,
    acc.currency
  );
  labelSumInterest.textContent = formatCur(intrest, acc.locale, acc.currency);
};

// update UI
const updateUI = function (acc) {
  // display movements
  displayMovements(acc);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  displaySummary(acc);
};

/////////////////////////////////////////////////
// creating usernames

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

createUsername(accounts);
console.log(accounts);

//////////////////////////////////////////////////
// set login timeout

const startLogOutTimer = function () {
  let time = 20;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time == 0) {
      clearInterval(timer);

      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    time--;
  };

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//////////////////////////////////////////////////
// login

let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.userName === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Hello, ${currentAccount.owner.split(" ")[0]}`;
  }

  containerApp.style.opacity = 1;

  // create current logged in date
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);

  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginPin.blur();

  // set logout time
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  // update UI
  updateUI(currentAccount);
});

/////////////////////////////////////////////////
// transfer money

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.userName === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    console.log("valid transfer ");
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

///////////////////////////////////////////////////
// loan

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    console.log(`${currentAccount.owner}, your loan request is in process...`);

    setTimeout(function () {
      console.log(
        `${currentAccount.owner}, your loan of ${amount} is approved`
      );

      currentAccount.movements.push(amount);

      // loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3500);
  }

  inputLoanAmount.value = "";
});

///////////////////////////////////////////////////
// close account

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.userName === currentAccount.userName
    );

    // delete account
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;

    console.log(accounts);
  }

  // // clear input fields
  inputCloseUsername.value = inputClosePin.value = "";
  inputClosePin.blur();
});

/////////////////////////////////////////////////
// sort movements
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
