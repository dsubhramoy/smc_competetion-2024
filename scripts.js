let masterData;
let bibhag;
let bishoy;
function handleClick() {
    // Get the selected values from the dropdowns
    
    const dropdown1Value = document.getElementById('dropdown1').value;
    const dropdown2Value = document.getElementById('dropdown2').value;

    // Call the function and pass the selected values
    processSelections(dropdown1Value, dropdown2Value);
    downloadButton = document.getElementById("downloadB");
    downloadButton.style.display='block';
}

function processSelections(value1, value2) {
    const dataTable1 =document.getElementById('dataTable');
    const dataTable2 =document.getElementById('dataTable2');
    if(value1==="সমগ্র তালিকা" && (value2=="সমগ্র তালিকা" || value2=="--")){
        console.log(masterData);
        displayData(masterData);
        dataTable1.style.display = 'block';
        bibhag=value1;
        bishoy=value2;
    }
    else{
        dataTable1.style.display = 'none';
        dataTable2.style.display = 'block';
        var bibhagV = 'সমগ্র তালিকা'
        
        if(value1==="বিভাগ - ক"){
            bibhagV = "ক"
        }
        if(value1==="বিভাগ - খ"){
            bibhagV = "খ"
        }
        if(value1==="বিভাগ - গ"){
            bibhagV = "গ"
        }
        console.log(value1,bibhagV,value2);
        var filteredmasterData;
        var filteredmasterDataFinal;
        if (value2==="সমগ্র তালিকা"){
            filteredmasterDataFinal = masterData.filter(item => item["বিভাগ"] === bibhagV);
        }
        else if(value2!=="সমগ্র তালিকা" && value2!=="--"){
            filteredmasterData = masterData.filter(item => item["বিভাগ"] === bibhagV);

            filteredmasterDataFinal = filteredmasterData.filter(item => item[value2] === "Y");
        }

        if (value1==="সমগ্র তালিকা" &&(value2!=="সমগ্র তালিকা" && value2!=="--")){
            filteredmasterDataFinal = masterData.filter(item => item[value2] === "Y");
        }
        console.log(filteredmasterDataFinal);
        displayFilteredData(filteredmasterDataFinal,bibhagV,value2)
        bibhag=value1;
        bishoy=value2;
    }
    
}
function displayFilteredData(data,bibhag,bishoy) {
    const tableBody = document.querySelector('#dataTable2 tbody');
    tableBody.innerHTML = '';  // Clear existing rows
        data.forEach(item => {
            const row = document.createElement('tr');
            const keys = [
                "কোড নং","প্রতিযোগীর নাম", "পিতা/অবিভাবকের নাম", "ঠিকানা ", "জন্ম তারিখ ","বয়স",
                "মোবাইল নাম্বার", "হোয়াটসঅ্যাপ নাম্বার"
            ];
            keys.forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = item[key] || ''; 
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });

}

function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first.');
        return;
    }
    const dropDowns = document.getElementById('dropdowns');
    dropDowns.style.visibility = 'visible';

    // Read the file
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume we're working with the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Clean and filter data
        const cleanedData = cleanAndFilterData(jsonData);

        // Display data (you can modify this part to suit your needs)
        const columnName = "বিষয়";
        const possibleValues = [
            "রবীন্দ্রসঙ্গীত",
            "নজরুল গীতি",
            "বাংলা ছড়ার গান/বাংলা আধুনিক গান",
            "বাংলা লোকসঙ্গীত",
            "আবৃত্তি",
            "একক নৃত্য",
            "তবলা",
            "অঙ্কন"
        ];
    
        const transformedData = splitColumnIntoFlags(cleanedData, columnName, possibleValues);
        dataWithID = transformedData.map((row, index) => ({
            ...row,
            "কোড নং": generateID(row, index)
        }));
        masterData = addDOB(dataWithID);

        //console.log(ageData);
        
    };
    reader.readAsArrayBuffer(file);
}

function cleanAndFilterData(data) {
    // Example: Exclude columns and filter rows based on some criteria
    return data.map(row => {
        const {Timestamp,"প্রমান পত্র (Birth Certificate) আপলোড করুন":_,"স্ক্রিনশট আপলোড করুন ":__, ...cleanedRow } = row; // Exclude specific columns
        return cleanedRow;
    })
}

function displayData(data) {
        const tableBody = document.querySelector('#dataTable tbody');
        tableBody.innerHTML = '';  // Clear existing rows
        data.forEach(item => {
            if (item["বিভাগ"] === "গ (১৮ বছরের ঊর্ধ্বে)") {
                item["বিভাগ"] = "গ";
            }
            if (item["বিভাগ"] === "খ (১২ বছরের ঊর্ধ্বে ও ১৮ বছরের নীচে)") {
                item["বিভাগ"] = "খ";
            }
            if (item["বিভাগ"] === "ক (১২ বছর বয়স পর্যন্ত)") {
                item["বিভাগ"] = "ক";
            }
        });
            data.forEach(item => {
                const row = document.createElement('tr');
                
                const keys = [
                    "কোড নং","প্রতিযোগীর নাম", "পিতা/অবিভাবকের নাম", "ঠিকানা ", "জন্ম তারিখ ","বয়স",
                    "মোবাইল নাম্বার", "হোয়াটসঅ্যাপ নাম্বার", "বিভাগ",
                    "রবীন্দ্রসঙ্গীত", "নজরুল গীতি", "বাংলা ছড়ার গান/বাংলা আধুনিক গান",
                    "বাংলা লোকসঙ্গীত", "আবৃত্তি", "একক নৃত্য", "তবলা", "অঙ্কন"
                ];
    
                keys.forEach(key => {
                    const cell = document.createElement('td');
                    if (key === "বিভাগ") {
                        
                        if (item["Error"]) {
                            cell.classList.add('error');
                        } else {
                            cell.classList.add('valid');
                        }
                    }
                    cell.textContent = item[key] || ''; 
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });

}


function splitColumnIntoFlags(data, columnName, values) {
    return data.map(row => {
      // Extract the column value and split it by commas and slashes
      const value = row[columnName] || '';
      const splitValues = value.split(",").map(v => v.trim());
  
      // Create flags for each possible value
      const newRow = values.reduce((acc, item) => {
        acc[item] = splitValues.includes(item) ? 'Y' : '';
        return acc;
      }, {});
  
      // Return the new row with flags and original data
      return { ...row, ...newRow };
    });
  }

  function generateID(row,index) {
    const flagMappings = {
      "রবীন্দ্রসঙ্গীত": "RS",
      "নজরুল গীতি": "NG",
      "বাংলা ছড়ার গান/বাংলা আধুনিক গান": "MS",
      "বাংলা লোকসঙ্গীত": "LS",
      "আবৃত্তি": "REC",
      "একক নৃত্য": "DAN",
      "তবলা": "TAB",
      "অঙ্কন": "DRW"
    };
    
    const idParts = [
        row["রবীন্দ্রসঙ্গীত"] === "Y" ? flagMappings["রবীন্দ্রসঙ্গীত"] : "",
        row["নজরুল গীতি"] === "Y" ? flagMappings["নজরুল গীতি"] : "",
        row["বাংলা ছড়ার গান/বাংলা আধুনিক গান"] === "Y" ? flagMappings["বাংলা ছড়ার গান/বাংলা আধুনিক গান"] : "",
        row["বাংলা লোকসঙ্গীত"] === "Y" ? flagMappings["বাংলা লোকসঙ্গীত"] : "",
        row["আবৃত্তি"] === "Y" ? flagMappings["আবৃত্তি"] : "",
        row["একক নৃত্য"] === "Y" ? flagMappings["একক নৃত্য"] : "",
        row["তবলা"] === "Y" ? flagMappings["তবলা"] : "",
        row["অঙ্কন"] === "Y" ? flagMappings["অঙ্কন"] : ""
      ];
    
      // Join parts with underscores and return the result
      if (row["বিভাগ"] === "গ (১৮ বছরের ঊর্ধ্বে)") {
        row["বিভাগ"] = "গ";
      }
      if (row["বিভাগ"] === "খ (১২ বছরের ঊর্ধ্বে ও ১৮ বছরের নীচে)") {
        row["বিভাগ"] = "খ";
      }
      if (row["বিভাগ"] === "ক (১২ বছর বয়স পর্যন্ত)") {
        row["বিভাগ"] = "ক";
      }


      const hasNonN = idParts.some(part => part !== "");
      const id = hasNonN
      ? idParts.filter(part => part !== "").join('/')
      : "";
      return `SMC/${row["বিভাগ"]}/${id}/${index+1}`;

  }

  
  function excelDateToJSDate(serial) {
    const startDate = new Date(1899, 11, 30); // Excel starts from December 30, 1899
    return new Date(startDate.getTime() + (serial * 86400000)); // 86400000 ms in a day
}

// Calculate age based on birthdate and current date
function calculateAge(birthDate, currentDate) {
    // Total days between the two dates
    const ageDifMs = currentDate - birthDate;
    const totalDays = Math.floor(ageDifMs / (1000 * 60 * 60 * 24));
    
    // Calculate years and remaining days
    var years = Math.floor(totalDays / 365.25); // Approximate years accounting for leap years
    
    const daysInYears = Math.floor(years * 365.25);
    const remainingDays = totalDays - daysInYears;
    if(years === -1){
        years = 0
    }
    return `${years}Y ${String(remainingDays)}D`;
}
function daysINYear(currentDate, birthDate){
    const ageDifMs = currentDate - birthDate;
    const totalDays = Math.floor(ageDifMs / (1000 * 60 * 60 * 24));
    return totalDays
}
function formatDateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function addDOB(data){
    return data.map(row => {
        const currentDate = new Date("01/09/2024");
        var dob = excelDateToJSDate(row["জন্ম তারিখ"]);
        const age = calculateAge(dob, currentDate);
        const ddb=formatDateToDDMMYYYY(dob);
        const calculatedAge = getValidDivision(dob, currentDate);
    
        const error = row["বিভাগ"] !== calculatedAge? "Invalid বিভাগ" : "";
        // Return the new row with flags and original data
        return { ...row,
            "জন্ম তারিখ ":ddb,
            "বয়স":age,
            Error:error
         };
      });

}
function getValidDivision(dob, currentDate) {
    ageInDays = daysINYear(currentDate,dob)
    if (ageInDays >= 6574) {
        return "গ (১৮ বছরের ঊর্ধ্বে)";
    } else if (ageInDays >= 4383 && ageInDays<6574) {
        return "খ (১২ বছরের ঊর্ধ্বে ও ১৮ বছরের নীচে)";
    } else {
        return "ক (১২ বছর বয়স পর্যন্ত)";
    }
}

function downloadCsv() {
    var table;
    if(bibhag==='সমগ্র তালিকা'&& bishoy==='সমগ্র তালিকা'){
        table = document.getElementById('dataTable');
    }
    table = document.getElementById('dataTable2');
    const rows = table.querySelectorAll('tr');

    // Create CSV data
    const csvRows = [];
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = Array.from(cols).map(col => col.textContent).join(',');
        csvRows.push(csvRow);
    });

    // Convert CSV rows to a string
    const csvString = csvRows.join('\n');

    // Create a blob and link for download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bibhag}_${bishoy}.csv`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
}