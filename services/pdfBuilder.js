const { requestGoogle } = require('./google');

function buildOrderHtml(d) {
  const v = (val) => (val && val !== '' && val !== 'undefined' && val !== null) ? String(val).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '—';
  const vc = (val, expected) => (String(val || '').toLowerCase() === String(expected || '').toLowerCase()) ? 'active' : '';
  const vChecked = (val, expected) => (String(val || '').toLowerCase() === String(expected || '').toLowerCase()) ? 'checked-box' : 'check-box';

  const orderNum = d.orderNumber || d['Order Number'] || 'AHL-XXXX';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Order Form - ${orderNum}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
  body { width: 210mm; background: #fff; color: #000; font-size: 11px; line-height: 1.3; }
  
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm 15mm;
    page-break-after: always;
    position: relative;
    background-color: #f2f7ec; /* Authentic light green tint */
  }
  .page:last-child {
    page-break-after: auto;
  }

  .header {
    text-align: center;
    color: #4a6fa5;
    font-size: 20px;
    letter-spacing: 2px;
    margin-bottom: 15px;
    text-transform: uppercase;
    font-weight: bold;
  }
  
  .flex { display: flex; }
  .flex-wrap { flex-wrap: wrap; }
  .space-between { justify-content: space-between; }
  .items-center { align-items: center; }
  .gap-10 { gap: 10px; }
  .mb-5 { margin-bottom: 5px; }
  .mb-10 { margin-bottom: 8px; }
  .mb-15 { margin-bottom: 12px; }
  .mb-20 { margin-bottom: 15px; }
  
  .line-input {
    border-bottom: 1px solid #777;
    padding: 0 5px;
    color: #0056b3;
    font-weight: bold;
    min-width: 80px;
    display: inline-block;
  }
  
  .check-box {
    display: inline-block;
    border: 1px solid #333;
    width: 13px;
    height: 13px;
    text-align: center;
    line-height: 11px;
    font-size: 11px;
    margin-right: 4px;
    background: #fff;
    vertical-align: middle;
  }
  
  .checked-box {
    display: inline-block;
    border: 1px solid #333;
    width: 13px;
    height: 13px;
    text-align: center;
    line-height: 11px;
    font-size: 11px;
    margin-right: 4px;
    background: #fff;
    vertical-align: middle;
    position: relative;
  }
  .checked-box::after {
    content: '✔';
    position: absolute;
    top: -2px; left: 1px;
    color: #0056b3;
    font-weight: bold;
  }

  .pill {
    border: 1px solid #555;
    border-radius: 10px;
    padding: 2px 8px;
    display: inline-block;
    background: #fff;
    margin: 2px;
    font-size: 10px;
  }
  .pill.active {
    border-color: #0056b3;
    background: #e0f2fe;
    color: #0056b3;
    font-weight: bold;
  }

  .section-pink { background-color: #fce4ec; border: 1px solid #f48fb1; padding: 10px; border-radius: 4px; }
  .section-purple { background-color: #f3e5f5; border: 1px solid #ce93d8; padding: 10px; border-radius: 4px; }
  .section-blue { background-color: #e3f2fd; border: 1px solid #90caf9; padding: 10px; border-radius: 4px; }
  
  .stripe-row { display: flex; border: 1px solid #b0bec5; margin-bottom: 2px; }
  .stripe-blue { background-color: #bbdefb; padding: 4px 6px; width: 150px; border-right: 1px solid #b0bec5; font-weight: bold; font-size: 10px; }
  .stripe-green { background-color: #c8e6c9; padding: 4px 6px; flex: 1; display: flex; align-items: center; font-size: 10px; }
  
  .todo-row { padding: 4px 8px; margin-bottom: 2px; border: 1px solid #ccc; background: #fff; font-size: 10px; }
  .todo-row.red { background-color: #ffcdd2; }
  .todo-row.yellow { background-color: #fff9c4; }
  .todo-row.pink { background-color: #f8bbd0; }
  .todo-row.blue { background-color: #bbdefb; }
  
  .sign-area {
    margin-top: 15px;
    float: right;
    text-align: center;
    border-top: 1px solid #333;
    padding-top: 4px;
    width: 140px;
    font-size: 10px;
  }
  .clearfix::after { content: ""; clear: both; display: table; }
</style>
</head>
<body>

<!-- ================== PAGE 1: CLIENT & APPOINTMENT / CONSULTATION / PAYMENT ================== -->
<div class="page">
  <div class="header">AMERICAN HAIRLINE</div>
  
  <div class="flex flex-wrap space-between mb-15 gap-10">
    <div style="width: 48%">
      <div class="mb-5"><strong>Order No:-</strong> <span class="line-input" style="width: 180px">${orderNum}</span></div>
      <div class="mb-5"><strong>Name:</strong> <span class="line-input" style="width: 200px">${v(d.clientName)}</span></div>
      <!-- NOTE: Client Phone Number is strictly excluded for confidentiality -->
      <div class="mb-5"><strong>City:</strong> <span class="line-input" style="width: 150px">${v(d.city)} ${d.cityOther ? '('+v(d.cityOther)+')' : ''}</span></div>
      <div class="mb-5"><strong>Branch:</strong> <span class="line-input" style="width: 150px">${v(d.branch)}</span></div>
      <div class="mb-5 flex items-center">
        <span style="margin-right:8px"><strong>Existing Wearer:</strong></span>
        <span class="pill ${vc(d.existingWearer, 'NBD') ? '' : 'active'}">Yes</span>
        <span class="pill ${vc(d.existingWearer, 'NBD')}">No</span>
        <span style="margin-left: 6px; color: #555">(${v(d.existingWearer)})</span>
      </div>
      <div class="mb-5 flex items-center">
        <span style="margin-right:8px"><strong>Unit No:</strong></span>
        <span class="pill ${vc(d.noOfUnits, '1') || vc(d.noOfUnits, '1 Unit') ? 'active' : ''}">1</span>
        <span class="pill ${vc(d.noOfUnits, '2') || vc(d.noOfUnits, '2 Units') ? 'active' : ''}">2</span>
        <span class="pill ${vc(d.noOfUnits, '3') || vc(d.noOfUnits, '3 Units') ? 'active' : ''}">3</span>
      </div>
    </div>
    <div style="width: 48%">
      <div class="mb-5"><strong>Order Date:</strong> <span class="line-input" style="width: 160px">${v(d.orderDate)}</span></div>
      <div class="mb-5"><strong>Delivery Date:</strong> <span class="line-input" style="width: 150px">${v(d.deliveryDate)}</span></div>
      <div class="mb-5"><strong>Consultation By:</strong> <span class="line-input" style="width: 140px">${v(d.consultationBy)}</span></div>
      <div class="mb-5"><strong>Tech Name:</strong> <span class="line-input" style="width: 160px">${v(d.technicianName)}</span></div>
      <div class="mb-5"><strong>Demo Given By:</strong> <span class="line-input" style="width: 140px">${v(d.demoGivenBy)}</span></div>
    </div>
  </div>

  <!-- CONSULTATION SECTION -->
  <div class="section-pink mb-10">
    <div style="font-weight:bold; margin-bottom:8px; color:#d81b60">As Discussed In Consultation :</div>
    
    <div class="flex space-between mb-5">
      <div>
        <strong>Clients Preference:</strong>
        <span class="pill ${vc(d.clientPreference, 'Stick On')}">Stick On</span>
        <span class="pill ${vc(d.clientPreference, 'Clip On')}">Clip On</span>
        <span class="pill ${vc(d.clientPreference, 'Clip+Frtape')}">Clip+Frtape</span>
      </div>
      <div><strong>Product ID:</strong> <span class="line-input" style="width: 130px">${v(d.productUniqueId || d.productId)}</span></div>
    </div>
    
    <div class="flex space-between">
      <div style="width: 50%">
        <div class="mb-5"><strong>Density:</strong> <span class="line-input" style="width: 160px">${v(d.consultDensity || d.density)}</span></div>
        <div class="mb-5"><strong>Hairline:</strong> <span class="line-input" style="width: 160px">${v(d.consultHairline || d.techHairline)}</span></div>
        <div class="mb-5"><strong>Hairstyle:</strong> <span class="line-input" style="width: 160px">${v(d.hairstyle)}</span></div>
        <div class="mb-5"><strong>Base:</strong> <span class="line-input" style="width: 180px">${v(d.consultBase || d.baseType)}</span></div>
        <div class="mb-5"><strong>Life:</strong> <span class="line-input" style="width: 180px">${v(d.life)}</span></div>
      </div>
      <div style="width: 48%">
        <div><strong>Notes :</strong></div>
        <div class="line-input" style="width: 100%; min-height: 60px; margin-top: 4px;">${v(d.notes1)}</div>
      </div>
    </div>
  </div>

  <!-- PAYMENT SECTION -->
  <div class="section-purple mb-10">
    <div style="margin-bottom:8px;">
      <strong>Payment Done By:</strong> 
      <span class="pill ${vc(d.paymentDoneBy, 'Cash')}">Cash</span>
      <span class="pill ${vc(d.paymentDoneBy, 'Card')}">Card</span>
      <span class="pill ${vc(d.paymentDoneBy, 'Online Transfer')}">Online</span>
      <span class="pill ${vc(d.paymentDoneBy, 'Bank Transfer')}">Bank Transfer</span>
      <span class="pill ${vc(d.paymentDoneBy, 'UPI')}">UPI</span>
    </div>
    
    <div class="flex space-between mb-5">
      <div style="width: 48%">
        <div class="mb-5"><strong>Total Bill Amt:</strong> <span class="line-input" style="width: 130px">₹${v(d.totalBillAmount)}</span></div>
        <div class="mb-5"><strong>Units Booked:</strong> <span class="line-input" style="width: 100px">${v(d.noOfUnits)}</span></div>
        <div class="mb-5"><strong>Advance Paid:</strong> <span class="line-input" style="width: 130px">₹${v(d.advancePaid)}</span></div>
        <div class="mb-5"><strong>Balance Payable:</strong> <span class="line-input" style="width: 120px">₹${v(d.balancePayable)}</span></div>
      </div>
      <div style="width: 48%">
        <div class="mb-5"><strong>Unit Cost:</strong> ₹<span class="line-input" style="width: 70px">${v(d.unitCost)}</span> + <strong>Rush:</strong> ( ₹<span class="line-input" style="width: 50px">${v(d.rushOrderCharges)}</span> )</div>
        <div class="mb-5">
          <strong>GST:</strong> 
          <span class="pill ${vc(d.gstPercentage, '10')}">10%</span>
          <span class="pill ${vc(d.gstPercentage, '15')}">15%</span>
          <span class="pill ${vc(d.gstPercentage, '18')}">18%</span>
          <span style="margin-left: 4px">(₹${v(d.gstAmountCharged)})</span>
        </div>
        <div class="mb-5">
          <strong>Changes in payment:</strong> 
          <span class="pill ${vc(d.changesInPayment, 'Yes')}">YES</span>
          <span class="pill ${vc(d.changesInPayment, 'No')}">NO</span>
        </div>
      </div>
    </div>
    <div><strong>Payment Notes:</strong> <span class="line-input" style="width: 80%">${v(d.notes2)}</span></div>
  </div>

  <div class="mb-10"><strong>Special Notes:</strong> <span class="line-input" style="width: 80%">${v(d.specialNotes)}</span></div>

  <div class="flex items-center mb-10 gap-10">
    <strong>Type Of Client:</strong> 
    <span class="pill ${vc(d.clientStatus, 'VIP')}">VIP</span>
    <span class="pill ${vc(d.clientStatus, 'VVIP')}">VVIP</span>
    <span class="pill ${vc(d.clientStatus, 'REGULAR')}">REGULAR</span>
  </div>

  <div class="flex items-center mb-10 gap-10">
    <strong>Type Of Order:</strong> 
    <span class="pill ${String(d.workType || '').includes('CUSTOM') && !String(d.workType || '').includes('SEMI') && !String(d.workType || '').includes('LOCAL') ? 'active' : ''}">CUSTOM 15,000/-</span>
    <span class="pill ${String(d.workType || '').includes('SEMI') ? 'active' : ''}">SEMI CUSTOM 10,000/-</span>
    <span class="pill ${String(d.workType || '').includes('LOCAL') ? 'active' : ''}">LOCAL CUSTOM 6,000/-</span>
    <span class="pill ${String(d.workType || '').includes('REGULAR') ? 'active' : ''}">REGULAR NO EXTRA</span>
  </div>

  <!-- STRIPES SECTION (MEDIA CONFIRMATIONS) -->
  <div class="stripe-row">
    <div class="stripe-blue">Pic Taken:</div>
    <div class="stripe-green">
      <span style="margin-right:15px"><span class="${vChecked(d.picTaken, 'Yes')}"></span> Yes</span>
      <span style="margin-right:15px"><span class="${vChecked(d.picTaken, 'No')}"></span> No</span>
      <span>Reason: <span class="line-input" style="width: 200px">${v(d.picTakenReason)}</span></span>
    </div>
  </div>
  <div class="stripe-row">
    <div class="stripe-blue" style="background:#5c6bc0; color:#fff">Video Taken:</div>
    <div class="stripe-green" style="background:#7986cb; color:#fff">
      <span style="margin-right:15px"><span class="${vChecked(d.videoTaken, 'Yes')}"></span> Yes</span>
      <span style="margin-right:15px"><span class="${vChecked(d.videoTaken, 'No')}"></span> No</span>
      <span>Reason: <span class="line-input" style="width: 200px">${v(d.videoTakenReason)}</span></span>
    </div>
  </div>
  <div class="stripe-row">
    <div class="stripe-blue">Mould Taken:</div>
    <div class="stripe-green">
      <span style="margin-right:15px"><span class="${vChecked(d.mouldTaken, 'Yes')}"></span> Yes</span>
      <span style="margin-right:15px"><span class="${vChecked(d.mouldTaken, 'No')}"></span> No</span>
      <span>Reason: <span class="line-input" style="width: 200px">${v(d.mouldTakenReason)}</span></span>
    </div>
  </div>
  <div class="stripe-row">
    <div class="stripe-blue" style="background:#5c6bc0; color:#fff">Demo Unit Pic:</div>
    <div class="stripe-green" style="background:#7986cb; color:#fff">
      <span style="margin-right:15px"><span class="${vChecked(d.picDemoUnit, 'Yes')}"></span> Yes</span>
      <span style="margin-right:15px"><span class="${vChecked(d.picDemoUnit, 'No')}"></span> No</span>
      <span>Reason: <span class="line-input" style="width: 200px">${v(d.picDemoUnitReason)}</span></span>
    </div>
  </div>

  <div class="clearfix">
    <div class="sign-area">Consultant Sign</div>
  </div>
</div>

<!-- ================== PAGE 2: CLIENT SPECIFICATION & TO-DO AFTERWORK ================== -->
<div class="page">
  <div class="header">AMERICAN HAIRLINE</div>
  <div style="text-align:right; font-size:10px; margin-bottom: 5px;">Page 2</div>
  
  <div class="section-blue mb-15">
    <div class="flex space-between mb-5">
      <div style="font-size:12px; font-weight:bold; color:#1565c0">Client Specification</div>
      <div><strong>Bleach Knots:</strong> <span class="pill ${vc(d.blechKnots, 'Yes')}">Yes</span> <span class="pill ${vc(d.blechKnots, 'No')}">No</span></div>
    </div>
    
    <div class="mb-5"><strong>Size:</strong> <span class="line-input" style="width: 120px">${v(d.size)}</span> &nbsp; <strong>Base Type:</strong> <span class="line-input" style="width: 140px">${v(d.baseType)}</span></div>
    
    <div class="mb-5 flex flex-wrap gap-10">
      ${['Full Lace','Neo','Infinity','Golden-Silk','Net Hairline','Uts','FF','Pu Hairline','Skin 1.5','Skin No 1','Skin No 2','Jadalace','Cng','Gts','L-A Base','Air-Lace','Q-6','German Lace','Bhlc - Euro','Mens-Full-Wig'].map(b => '<span class="pill ' + vc(d.baseType, b) + '">' + b + '</span>').join('')}
    </div>
    
    <div class="mb-5">
      <strong>Code:</strong> 
      <span class="pill ${vc(d.code, 'NAN')}">NAN</span>
      <span class="pill ${vc(d.code, 'H.N')}">H.N</span>
      <span class="pill ${vc(d.code, 'B/M')}">B/M</span>
      <span class="pill ${vc(d.code, 'KRANTI')}">KRANTI</span>
    </div>
    
    <div class="mb-5">
      <strong>Colour:</strong> 
      <span class="pill ${vc(d.colour, '#1A')}">#1A</span>
      <span class="pill ${vc(d.colour, '#1B')}">#1B</span>
      <span class="pill ${vc(d.colour, '#2')}">#2</span>
      <span class="pill ${vc(d.colour, '#3')}">#3</span>
      <span class="pill ${vc(d.colour, '#4')}">#4</span>
      <span class="pill ${vc(d.colour, '#5')}">#5</span>
      <span class="pill ${vc(d.colour, '#NC')}">#NC</span>
      <span class="pill ${d.colour === 'Other' || (d.targetColour && !['#1A','#1B','#2','#3','#4','#5','#NC'].includes(d.colour)) ? 'active' : ''}">Other</span>
      &nbsp;&nbsp;<strong>Target Colour:</strong> <span class="line-input" style="width: 120px">${v(d.targetColour)}</span>
    </div>
    
    <div class="mb-5">
      <strong>Greys (%):</strong> 
      <span class="pill ${vc(d.grey, '10')}">10</span>
      <span class="pill ${vc(d.grey, '20')}">20</span>
      <span class="pill ${vc(d.grey, '30')}">30</span>
      <span class="pill ${vc(d.grey, '40')}">40</span>
      <span class="pill ${vc(d.grey, '50')}">50</span>
      <span class="pill ${vc(d.grey, '60')}">60</span>
      <span class="pill ${vc(d.grey, '65')}">65</span>
      <span class="pill ${vc(d.grey, 'None') || !d.grey ? 'active' : ''}">None</span>
    </div>
    
    <div class="flex mb-10">
      <div style="width:50%">
        <strong>Base Hairline:</strong> <span class="pill ${vc(d.baseHairline, 'Yes')}">Yes</span> <span class="pill ${vc(d.baseHairline, 'No')}">No</span>
      </div>
      <div style="width:50%">
        <strong>Client Hairline:</strong> <span class="pill ${vc(d.clientHairline, 'Yes')}">Yes</span> <span class="pill ${vc(d.clientHairline, 'No')}">No</span>
      </div>
    </div>
    
    <div class="flex space-between">
      <div style="width:50%">
        <div class="mb-5"><strong>Type Of Density (Optional / Lace Spec):</strong></div>
        <div style="font-size:10px; color:#444">
          <div>Full Lace: Bhlc Medium, Bhlc-Euro-Heavy, Champion-Medium, Amy-Medium</div>
          <div>Air Lace: Champion-Heavy, Nan-Low</div>
        </div>
        <div style="margin-top:4px; font-weight:bold; color:#0056b3">${v(d.typeOfDensity)}</div>
      </div>
      <div style="width:48%">
        <div><strong>Client Spec Notes:</strong></div>
        <div class="line-input" style="width: 100%; min-height: 50px; margin-top: 4px;">${v(d.notes3)}</div>
      </div>
    </div>
  </div>

  <div class="mb-5"><strong>To Do Afterwork:</strong></div>
  
  <div class="todo-row red">1. Make Natural Hairline In Front. ${String(d.toDoAfterwork||'').includes('1') || String(d.toDoAfterwork||'').includes('Natural Hairline') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">2. Bleach Only Front Hairline. ${String(d.toDoAfterwork||'').includes('2') || String(d.toDoAfterwork||'').includes('Bleach Only Front') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row pink">3. Bleach System Knots. ${String(d.toDoAfterwork||'').includes('3') || String(d.toDoAfterwork||'').includes('Bleach System Knots') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">4. 1 Inch Filling Front & Back. ${String(d.toDoAfterwork||'').includes('4') || String(d.toDoAfterwork||'').includes('1 Inch Filling') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row pink">5. Want Puff Work, Extra Filling In Half System For Density. ${String(d.toDoAfterwork||'').includes('5') || String(d.toDoAfterwork||'').includes('Puff Work') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">6. Cysteine In Front. ${String(d.toDoAfterwork||'').includes('6') || String(d.toDoAfterwork||'').includes('Cysteine') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row pink">7. Purming In System. ${String(d.toDoAfterwork||'').includes('7') || String(d.toDoAfterwork||'').includes('Purming') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">8. Greys. ${String(d.toDoAfterwork||'').includes('8') || String(d.toDoAfterwork||'').includes('Greys') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row pink">9. Add Clips. ${String(d.toDoAfterwork||'').includes('9') || String(d.toDoAfterwork||'').includes('Clips') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">10. Add Colour. ${String(d.toDoAfterwork||'').includes('10') || String(d.toDoAfterwork||'').includes('Colour') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row pink">11. Increase Density By Filling. ${String(d.toDoAfterwork||'').includes('11') || String(d.toDoAfterwork||'').includes('Filling') ? '<b>✔</b>' : ''}</div>
  <div class="todo-row yellow">12. Arrange Mould. ${String(d.toDoAfterwork||'').includes('12') || String(d.toDoAfterwork||'').includes('Arrange Mould') ? '<b>✔</b>' : ''}</div>

  <div class="clearfix">
    <div class="sign-area">Technician Sign</div>
  </div>
</div>

<!-- ================== PAGE 3: TECHNICIAN MEASUREMENTS & SPECIFICATIONS ================== -->
<div class="page">
  <div class="header">AMERICAN HAIRLINE</div>
  <div style="text-align:right; font-size:10px; margin-bottom: 5px;">Page 3</div>
  
  <div style="border: 1px solid #4a6fa5; border-radius: 4px; padding: 10px; background: #fff; margin-bottom: 12px;">
    <div style="font-weight:bold; color:#1e3a8a; margin-bottom:8px; font-size:12px;">TECHNICIAN SPECIFICATIONS & MEASUREMENTS</div>
    <div class="flex space-between mb-10">
      <div><strong>Top:</strong> <span class="line-input" style="width: 70px">${v(d.top)} in</span></div>
      <div><strong>Front:</strong> <span class="line-input" style="width: 70px">${v(d.front)} in</span></div>
      <div><strong>Side:</strong> <span class="line-input" style="width: 70px">${v(d.side)} in</span></div>
      <div><strong>Back:</strong> <span class="line-input" style="width: 70px">${v(d.back)} in</span></div>
    </div>
    
    <div class="flex space-between mb-10">
      <div><strong>Hair Length:</strong> <span class="line-input" style="width: 120px">${v(d.hairLength)}</span></div>
      <div><strong>Parting:</strong> <span class="line-input" style="width: 120px">${v(d.parting)}</span></div>
      <div><strong>Tech Hairline:</strong> <span class="line-input" style="width: 120px">${v(d.techHairline || d.consultHairline)}</span></div>
      <div><strong>Front Shape:</strong> <span class="line-input" style="width: 120px">${v(d.hairlineShaped)}</span></div>
    </div>
    
    <div class="flex space-between mb-10">
      <div><strong>Hairline Shape:</strong> <span class="line-input" style="width: 140px">${v(d.hairlineShape)}</span></div>
      <div><strong>Client Type:</strong> <span class="line-input" style="width: 120px">${v(d.typeOfClient)}</span></div>
      <div><strong>Client Order Like:</strong> <span class="line-input" style="width: 140px">${v(d.clientOrderLike)}</span></div>
      <div><strong>As Per Date:</strong> <span class="line-input" style="width: 100px">${v(d.asPerDate)}</span></div>
    </div>
    
    <div><strong>Technician Notes (Notes 4):</strong></div>
    <div class="line-input" style="width: 100%; min-height: 80px; margin-top: 5px;">${v(d.notes4)}</div>
  </div>

  <div class="clearfix">
    <div class="sign-area">Final Inspection Sign</div>
  </div>
</div>

</body>
</html>`;
}

/**
 * Regenerates the PDF in Google Drive
 */
async function syncPdfToDrive(orderData) {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1fkoqNh-26LdbaOxTD7kC3glmd3AtgdIc';
    const orderNumber = orderData.orderNumber || 'AHL-ORDER';
    const fileName = `${orderNumber}.html`;

    const htmlContent = buildOrderHtml(orderData);

    // 1. Search if an existing file with this name exists in Drive
    const q = encodeURIComponent(`name = '${orderNumber}' or name = '${fileName}' or name = '${orderNumber}.pdf'`);
    const searchRes = await requestGoogle(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`);
    const existingFile = searchRes.data?.files?.[0];

    if (existingFile) {
      // Update existing file content
      const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
      await requestGoogle(uploadUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'text/html' },
        body: htmlContent
      });
      return existingFile.webViewLink || `https://drive.google.com/file/d/${existingFile.id}/view`;
    } else {
      // Create new file
      const createRes = await requestGoogle('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: {
          name: `${orderNumber}.html`,
          parents: [rootFolderId]
        }
      });
      if (createRes.data?.id) {
        const fileId = createRes.data.id;
        await requestGoogle(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'text/html' },
          body: htmlContent
        });
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    return '';
  } catch (err) {
    console.warn('PDF Drive Sync warning:', err.message);
    return orderData.pdfUrl || '';
  }
}

module.exports = {
  buildOrderHtml,
  syncPdfToDrive
};
