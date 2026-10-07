const startButton = document.getElementById('startShift');
const shiftStatus = document.getElementById('shiftStatus');
const startMileage = document.getElementById('startMileage');
const sideGig = document.getElementById('sideGig');
const endMileage = document.getElementById('endMileage');
const earnings = document.getElementById('earnings');
const endButton = document.getElementById('endShift');
const shiftSummary = document.getElementById('shiftSummary');
const shiftHistoryDisplay = document.getElementById('shiftHistory');

let activeStartTime = null;
let activeSideGig = '';
let activeStartMileage = null;
let shiftHistory = [];

const savedHistory = localStorage.getItem('shiftHistory');
const savedActiveShift = localStorage.getItem('activeShift');

  if (savedHistory !==null){
    shiftHistory = JSON.parse(savedHistory);
}

  if (savedActiveShift !==null){
    const restoredShift = JSON.parse(savedActiveShift);
    activeSideGig = restoredShift.sideGig;
    activeStartMileage = restoredShift.startMileage;
    activeStartTime = new Date(restoredShift.startTime);
  }

displayShiftHistory();

startButton.addEventListener('click', function () {
  if (startMileage.value === '' || sideGig.value === '') {
    shiftStatus.textContent =
      'Please select a side gig and enter your starting mileage.';
  } else {
    activeSideGig = sideGig.value;
    activeStartMileage = Number(startMileage.value);
    activeStartTime = new Date();

    const activeShift = {
      sideGig: activeSideGig,
      startMileage: activeStartMileage,
      startTime: activeStartTime,
    }

    localStorage.setItem('activeShift', JSON.stringify (activeShift));

    shiftStatus.textContent =
      ' Your ' +
      sideGig.value +
      ' shift started at ' +
      startMileage.value +
      ' miles.';
  }
});

endButton.addEventListener('click', function () {
  if (activeStartMileage === null) {
    shiftSummary.textContent = 'Please start a shift before ending it.'; 
  } else if (endMileage.value === '' || earnings.value === '') {
    shiftSummary.textContent = 'Please enter your ending mileage and earnings.';
  } else {
    const totalMiles = Number(endMileage.value) - activeStartMileage;
    if (totalMiles< 0) {
      shiftSummary.textContent = 'Please re-enter miles.';
    } else {

    const endTime = new Date();
    const shiftMilliseconds = endTime-activeStartTime;
    const totalMinutes = Math.floor(shiftMilliseconds / 60000);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;
    const shiftHours = shiftMilliseconds/3600000;
    const hourlyRate = Number(earnings.value) / shiftHours;
    const earningsPerMile = Number (earnings.value) / totalMiles;
    const completedShift = {
      sideGig: activeSideGig,
      startTime: activeStartTime,
      endTime: endTime,
      startMileage: activeStartMileage,
      endMileage: Number(endMileage.value),
      totalMiles: totalMiles,
      earnings: Number(earnings.value),
      shiftHours: shiftHours,
      hourlyRate: hourlyRate,
      earningsPerMile: earningsPerMile
    };
    shiftHistory.push(completedShift);
    localStorage.setItem('shiftHistory', JSON.stringify(shiftHistory));
    localStorage.removeItem('activeShift');
    
    activeStartTime = null;
    activeSideGig = '';
    activeStartMileage = null;
    
    console.log(shiftHistory);
    displayShiftHistory();

    shiftSummary.textContent =
        'Total miles: ' + totalMiles + 
        ' | Earnings: $' + Number(earnings.value).toFixed(2) + 
        ' | Time: ' + displayHours + ' hr ' + displayMinutes + ' min' +
        ' |$/mile: $' + earningsPerMile.toFixed(2) + 
        ' | $/hr: $' + hourlyRate.toFixed(2);
    }
  }
});
function displayShiftHistory () {
  console.log('UPDATED HISTORY FUNCTION IS RUNNING');
  shiftHistoryDisplay.innerHTML = '';

  shiftHistory.slice(-10).reverse().forEach(function (shift) {
    const shiftItem = document.createElement('p');
    const shiftDate = new Date(shift.startTime);

    shiftItem.textContent =
      shiftDate.toLocaleDateString() + ' | ' + 
      shift.sideGig + ' | ' +
      shift.totalMiles + ' miles  | $' +
      shift.earnings.toFixed(2);

  shiftHistoryDisplay.appendChild(shiftItem);


  });
}


document.getElementById('exportCSV').addEventListener('click', function () {
  if (shiftHistory.length === 0) {
    alert('No shift history to export yet.');
    return;
  }

  const headers = [
    'Side Gig', 'Start Time', 'End Time',
    'Starting Mileage', 'Ending Mileage', 'Total Miles',
    'Earnings', 'Hours Worked', 'Hourly Rate', 'Earnings Per Mile'
  ];

  const rows = shiftHistory.map(function (shift) {
    return [
      shift.sideGig,
      new Date(shift.startTime).toLocaleString(),
      new Date(shift.endTime).toLocaleString(),
      shift.startMileage,
      shift.endMileage,
      shift.totalMiles,
      shift.earnings,
      shift.shiftHours,
      shift.hourlyRate,
      shift.earningsPerMile
    ];
  });

  const csv = [headers, ...rows]
    .map(function (row) {
      return row.map(function (value) {
        return '"' + String(value ?? '').replace(/"/g, '""') + '"';
      }).join(',');
    })
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'mileage-history.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
});
