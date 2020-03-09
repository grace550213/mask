//取得時間
var nD = new Date();
var year = nD.getFullYear();
var Month = (nD.getMonth()+1<10 ? '0' : '')+(nD.getMonth()+1);
var day = (nD.getDate()+1<10 ? '0' : '')+nD.getDate();
var week = nD.getDay();
var aryWeek = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
var todayTime = document.querySelector('.todayTime')
var todayWeek = document.querySelector('.todayWeek')
todayTime.innerHTML = year+'-'+Month+'-'+day
todayWeek.innerHTML = aryWeek[week]

//判斷身分證數字是否購買
var peopleId = document.querySelector('.peopleId')
if(week == 2 || week ==4 || week ==6){
     peopleId.innerHTML = '身分證末碼為<span>2,4,6,8,0</span>可購買'
}else if(week == 1 || week == 3 || week == 5){
	 peopleId.innerHTML = '身分證末碼為<span>1,3,5,7,9</span>可購買'
}else{
	 peopleId.innerHTML = '<sapn>不限身分證字號</span>，大家都可購買'
} 


//載入leaflet的地圖
var mymap = L.map('map', {
    center: [24.8067338, 120.9991027],
    zoom: 16
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

//maker顏色 https://github.com/pointhi/leaflet-color-markers
var blueIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var orangeIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

//用markerClusterGroup來群組化座標，提高座標的效率(新增一個塗層)
var markers = new L.MarkerClusterGroup().addTo(mymap);

//用JSON撈資料
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send();
let data;
xhr.onload = function () {
	document.querySelector('.loading').style.display = 'none'
     data = JSON.parse(xhr.responseText).features;
    //判斷有無口罩
    for (let i = 0; i < data.length; i++) {
        var mask;
        if (data[i].properties.mask_adult == 0 && data[i].properties.mask_child == 0) {
            mask = redIcon;
        } else if(data[i].properties.mask_adult == 0){
            mask = orangeIcon;
        }else {
            mask = blueIcon;
        }
        //把藍紅座標加入markers塗層裡
        let eachIcon = L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: mask })
            .bindPopup(
                '<h3 id="'+data[i].properties.id+'">' + data[i].properties.name + '</h3>' +
                '<p class="mt-0 mb-1">' + data[i].properties.address + '</p>' +
                '<p class="mt-0 mb-1">' + data[i].properties.phone + '</p>' +
                '<p class="mt-0 mb-2">'+data[i].properties.note+'</p>'+
                '<div class="d-flex justify-content-between">' +
                '<button type="button" class="btn btn-info store-btn" style="color:#FFFFFF;">成人口罩&nbsp&nbsp&nbsp&nbsp' + data[i].properties.mask_adult + '</button>' +
                '<button type="button" class="btn btn-warning store-btn" style="color:#FFFFFF;">兒童口罩&nbsp&nbsp&nbsp&nbsp' + data[i].properties.mask_child + '</button>'
            )
        data[i].icon = eachIcon;
        markers.addLayer(eachIcon);

    }
    mymap.addLayer(markers);
   

//先跑出全部資料 
	var strStore = '';    
    for(let i = 0; i < 10; i++){
   	    
   	    //<i class="fas fa-2x fa-search-location mark ></i>
          	   strStore +=  '<div class="eachStore" mapid="'+data[i].geometry.coordinates[1]+','+data[i].geometry.coordinates[0]+'"><h3 class="pt-2">'+data[i].properties.name
          	                // '<a href="#" class="d-flex ml-auto flyTo"></a>
          	                +'</h3>'+
                             '<p class="mb-1">'+data[i].properties.address+'</p>'+
                             '<p class="mb-1">'+data[i].properties.phone+'</p>'+
                             '<p class="mb-2">'+data[i].properties.note+'</p>'+
                             '<div class="d-md-flex justify-content-md-between mb-2">'+
                             '<button type="button" class="btn btn-info store-btn">成人口罩&nbsp&nbsp&nbsp&nbsp<span>'+data[i].properties.mask_adult+'</span></button>'+
                             '<button type="button" class="btn btn-warning store-btn">兒童口罩&nbsp&nbsp&nbsp&nbsp<span>'+data[i].properties.mask_child+'</span></button></div></div>'
        	}  
          document.querySelector('.store').innerHTML = strStore ;


          //點擊左側藥局，連至地圖上
          function findStore(){
          	let eachStore= document.querySelectorAll('.eachStore');
          eachStore.forEach(function(item){
          	item.addEventListener('click',function(e){
	            let storeOnMap = this.getAttribute("mapid").split(",");
	            //console.log(storeOnMap);
	            let lng = storeOnMap[0];
	            let lat = storeOnMap[1];
	            //L.marker(storeOnMap).addTo(mymap);
	            mymap.setView([lng,lat],18);

	            //打開marker
	             for (let i = 0; i < data.length; i++) {
                     let [lat2,lng2] = data[i].geometry.coordinates; 
                     if (lng2 == lng && lat2 == lat) {
                     	//console.log("[lng2 , lat2]");
                        data[i].icon.openPopup();

                         break;
                    }
                 }
            },false)
        });
    }
    
    findStore()
}


   

    
//縣市JSON
var tw = [

{
    'county' : '--請選擇縣市--',
    'town' : ''

},
{ 
	'county' : '臺北市', 
	'town' : ['--請選擇地區--','中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區' ]
} ,
{ 
	'county' : '新北市',
	'town' : ['--請選擇地區--','板橋區', '新莊區', '中和區', '永和區', '土城區', '樹林區', '三峽區', '鶯歌區', '三重區', '蘆洲區', '五股區', '泰山區', '林口區', '八里區', '淡水區', '三芝區', '石門區', '金山區', '萬里區', '汐止區', '瑞芳區', '貢寮區', '平溪區', '雙溪區', '新店區', '深坑區', '石碇區', '坪林區', '烏來區'] 
},
{ 
	'county' : '桃園市',
	'town' : ['--請選擇地區--', '桃園區','中壢區','平鎮區','八德區','楊梅區','蘆竹區','大溪區','龍潭區','龜山區','大園區','觀音區','新屋區','復興區']
},
{
	'county' : '臺中市',
	'town' : ['--請選擇地區--','中區','東區','南區','西區','北區','北屯區','西屯區','南屯區','太平區','大里區','霧峰區','烏日區','豐原區','后里區','石岡區','東勢區','新社區','潭子區','大雅區','神岡區','大肚區','沙鹿區','龍井區','梧棲區','清水區','大甲區','外埔區','大安區','和平區']
},
{
	'county' : '臺南市',
	'town' : ['--請選擇地區--','中西區','東區','南區','北區','安平區','安南區','永康區','歸仁區','新化區','左鎮區','玉井區','楠西區','南化區','仁德區','關廟區','龍崎區','官田區','麻豆區','佳里區','西港區','七股區','將軍區','學甲區','北門區','新營區','後壁區','白河區','東山區','六甲區','下營區','柳營區','鹽水區','善化區','大內區','山上區','新市區','安定區']
},
{
    'county' :'高雄市',
    'town' : ['--請選擇地區--','楠梓區','左營區','鼓山區','三民區','鹽埕區','前金區','新興區','苓雅區','前鎮區','旗津區','小港區','鳳山區','大寮區','鳥松區','林園區','仁武區','大樹區','大社區','岡山區','路竹區','橋頭區','梓官區','彌陀區','永安區','燕巢區','田寮區','阿蓮區','茄萣區','湖內區','旗山區','美濃區','內門區','杉林區','甲仙區','六龜區','茂林區','桃源區','那瑪夏區']
},
{
	'county' :'基隆市',
	'town' : ['--請選擇地區--','仁愛區','中正區','信義區','中山區','安樂區','暖暖區','七堵區']
},
{
	'county' :'新竹市',
	'town' : ['--請選擇地區--','東區','北區','香山區']
},
{
	'county' :'嘉義市',
	'town' : ['--請選擇地區--','東區','西區']
},
{
	'county' :'新竹縣',
	'town' : ['--請選擇地區--','竹北市','竹東鎮','新埔鎮','關西鎮','湖口鄉','新豐鄉','峨眉鄉','寶山鄉','北埔鄉','芎林鄉','橫山鄉','尖石鄉','五峰鄉']
},
{
	'county' :'苗栗縣',
	'town' : ['--請選擇地區--','苗栗市','頭份市','竹南鎮','後龍鎮','通霄鎮','苑裡鎮','卓蘭鎮','造橋鄉','西湖鄉','頭屋鄉','公館鄉','銅鑼鄉','三義鄉','大湖鄉','獅潭鄉','三灣鄉','南庄鄉','泰安鄉']
},
{
	'county' :'彰化縣',
	'town' : ['--請選擇地區--','彰化市','員林市','和美鎮','鹿港鎮','溪湖鎮','二林鎮','田中鎮','北斗鎮','花壇鄉','芬園鄉','大村鄉','永靖鄉','伸港鄉','線西鄉','福興鄉','秀水鄉','埔心鄉','埔鹽鄉','大城鄉','芳苑鄉','竹塘鄉','社頭鄉','二水鄉','田尾鄉','埤頭鄉','溪州鄉']
},
{
	'county' :'南投縣',
	'town' : ['--請選擇地區--','南投市','埔里鎮','草屯鎮','竹山鎮','集集鎮','名間鄉','鹿谷鄉','中寮鄉','魚池鄉','國姓鄉','水里鄉','信義鄉','仁愛鄉']
},
{
    'county' :'雲林縣',
    'town' : ['--請選擇地區--','斗六市','斗南鎮','虎尾鎮','西螺鎮','土庫鎮','北港鎮','林內鄉','古坑鄉','大埤鄉','莿桐鄉','褒忠鄉','二崙鄉','崙背鄉','麥寮鄉','臺西鄉','東勢鄉','元長鄉','四湖鄉','口湖鄉','水林鄉']
},
{
	'county' :'嘉義縣',
	'town' : ['--請選擇地區--','太保市','朴子市','布袋鎮','大林鎮','民雄鄉','溪口鄉','新港鄉','六腳鄉','東石鄉','義竹鄉','鹿草鄉','水上鄉','中埔鄉','竹崎鄉','梅山鄉','番路鄉','大埔鄉','阿里山鄉']
},
{
	'county' :'屏東縣',
	'town' : ['--請選擇地區--','屏東市','潮州鎮','東港鎮','恆春鎮','萬丹鄉','長治鄉','麟洛鄉','九如鄉','里港鄉','鹽埔鄉','高樹鄉','萬巒鄉','內埔鄉','竹田鄉','新埤鄉','枋寮鄉','新園鄉','崁頂鄉','林邊鄉','南州鄉','佳冬鄉','琉球鄉','車城鄉','滿州鄉','枋山鄉','霧臺鄉','瑪家鄉','泰武鄉','來義鄉','春日鄉','獅子鄉','牡丹鄉','三地門鄉']
},
{
	'county' :'宜蘭縣',
	'town' : ['--請選擇地區--','宜蘭市','頭城鎮','羅東鎮','蘇澳鎮','礁溪鄉','壯圍鄉','員山鄉','冬山鄉','五結鄉','三星鄉','大同鄉','南澳鄉']
},
{
	'county' :'花蓮縣',
	'town' : ['--請選擇地區--','花蓮市','鳳林鎮','玉里鎮','新城鄉','吉安鄉','壽豐鄉','光復鄉','豐濱鄉','瑞穗鄉','富里鄉','秀林鄉','萬榮鄉','卓溪鄉']
},
{
	'county' :'臺東縣',
	'town' : ['--請選擇地區--','臺東市','成功鎮','關山鎮','長濱鄉','池上鄉','東河鄉','鹿野鄉','卑南鄉','大武鄉','綠島鄉','太麻里鄉','海端鄉','延平鄉','金峰鄉','達仁鄉','蘭嶼鄉']
},
{
	'county' :'澎湖縣',
	'town' : ['--請選擇地區--','馬公市','湖西鄉','白沙鄉','西嶼鄉','望安鄉','七美鄉']
},
{
	'county' :'金門縣',
	'town' : ['--請選擇地區--','金城鎮','金湖鎮','金沙鎮','金寧鄉','烈嶼鄉','烏坵鄉']
},
{
	'county' :'連江縣',
	'town' : ['--請選擇地區--','南竿鄉','北竿鄉','莒光鄉','東引鄉']
}
]
//把縣市抓進select裡面
var myCounty = document.querySelector('.county');
var countyData = '';
    for (let i = 0; i < tw.length; i++) {
        countyData += '<option class="counties" value="'+tw[i].county+'">' + tw[i].county + '</option>'
    }
    myCounty.innerHTML = countyData;



//把區域抓進select裡
var myTown = document.querySelector('.town');
myCounty.addEventListener('change',function(){ 
var townData = '';
	for (let i = 0; i < tw.length; i++) {
	    if(myCounty.value==tw[i].county){
           for(let u = 0; u <  tw[i].town.length; u++){
			   townData += '<option class="towns" value="'+tw[i].town[u]+'">' + tw[i].town[u] + '</option>'
	       }
	    myTown.innerHTML = townData;
	    }
    }
}, false)
//選擇完區域，下面顯示相對應store
myTown.addEventListener('change',function(e){
	showStore(e.target.value,myCounty.value);
	 //點擊左側藥局，連至地圖上
          function findStore(){
          	let eachStore= document.querySelectorAll('.eachStore');
          eachStore.forEach(function(item){
          	item.addEventListener('click',function(e){
	            let storeOnMap = this.getAttribute("mapid").split(",");
	            //console.log(storeOnMap);
	            let lng = storeOnMap[0];
	            let lat = storeOnMap[1];
	            //L.marker(storeOnMap).addTo(mymap);
	            mymap.setView([lng,lat],18);

	            //打開marker
	            for (let i = 0; i < data.length; i++) {
                     let [lat2,lng2] = data[i].geometry.coordinates; 
                     if (lng2 == lng && lat2 == lat) {
                     	//console.log("[lng2 , lat2]");
                        data[i].icon.openPopup();

                         break;
                    }
                 }
	           
            })
        });
    }
    findStore()
})


function showStore(area,city){
    	var storeData = '';
    	
    	for(let i = 0; i < data.length; i++){
    	    if(data[i].properties.town==area && data[i].properties.county==city){
          
          	   storeData +='<div class="eachStore" mapid="'+data[i].geometry.coordinates[1]+','+data[i].geometry.coordinates[0]+'"><h3 class="pt-2">'+data[i].properties.name
          	                // '<a href="#" class="d-flex ml-auto flyTo"></a>
          	                +'</h3>'+
                             '<p class="mb-1">'+data[i].properties.address+'</p>'+
                             '<p class="mb-1">'+data[i].properties.phone+'</p>'+
                             '<p class="mb-2">'+data[i].properties.note+'</p>'+
                             '<div class="d-flex justify-content-between mb-2">'+
                             '<button type="button" class="btn btn-info store-btn">成人口罩&nbsp&nbsp&nbsp&nbsp<span>'+data[i].properties.mask_adult+'</span></button>'+
                             '<button type="button" class="btn btn-warning store-btn">兒童口罩&nbsp&nbsp&nbsp&nbsp<span>'+data[i].properties.mask_child+'</span></button></div></div>'
          }
          document.querySelector('.store').innerHTML = storeData ; 
    	}
    }

 /*  $(document).ready(function(){
  $("showSide").click(function(){
    $("leftbox").addClass("hideSide");
  });
});*/
var arrow = document.querySelector('.arrow');
arrow.onclick = function(){
    var leftbox = document.querySelector('.leftbox');
    var map = document.getElementById('map');
	leftbox.classList.toggle('hide');
	this.classList.toggle('arrowHide');
	map.classList.toggle('mapChangeSize');
   // leftbox.style.transform = 'translateX(-100%)';
   // leftbox.style.display = 'hidden';
}
