<template>
  <q-btn @click="printerStore.setActiveTab(0)">К таблице печати</q-btn>

  <div id="customCh"></div>

</template>

<script>
import * as echarts from 'echarts';
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';
export default {
  name: "CustomChart",
  setup(){
    const printerStore=usePrinterStore();
    const { chartsData,printers, beginningDate, endDate } =storeToRefs(printerStore);

    return{
      printerStore,
      chartsData,
      printers,
      beginningDate,
      endDate,
    }
  },
  methods : {
    createCustomChart : function(){

      let bD=this.beginningDate;
      let eD=this.endDate;



      let custEl=document.createElement('div');
      let customCh=document.querySelector('#customCh');
      custEl.style.height='500px';
      custEl.style.width='100%'
      custEl.style.borderStyle='solid';
      custEl.style.borderColor='black';
      customCh.append(custEl);

      //Формируем массив данных для диаграммы

      //Создаем переменную для хранения отметки начала временной шкалы по оси X
      let startTime=0;

      //Создаем массив данных по каждой работе для отрисовки в диаграмме
      let data=[];
      //Создаем массив категорий для оси Y
      let categories=[];
      //Заполняем
      this.printers.forEach(function(printer,index){
        console.log(bD);
        console.log(eD);
        categories.push(printer.printerName);
        for (let job of printer['result']['jobs']){

          //Проверяем, входит ли дата создания данной печати в период фильтрации
          //и проверяем валидность периода выполнения задачи (убираем работы без 'start_time', 'end_time' и 'total_duration')
          let dataJob=new Date(Number(job['start_time'])*1000);
          if ((job['start_time'] && job['end_time'] && job['total_duration']) && ((bD===0 && eD===0) || (dataJob>=bD && dataJob<=eD))) {


            //Обновляем startTime
            if (startTime===0 || Number(job['start_time'])<startTime){
              startTime=Number(job['start_time']);
            }
            //Вычисляем цвет отрисовки элемента в зависимости от статуса
            let itemColor;
            switch (job['status']){
              case 'completed':
                itemColor='green';
                break;
              case 'cancelled':
                itemColor='yellow';
                break;
              case 'failed':
                itemColor='red';
                break;
              default:
                itemColor='blue';
            }
            //Создаем объект, содержащий информацию по текущей работе для отрисовки графика
            let jobChartInfo={
              name : job['name'],
              value : [index, Number(job['start_time']), Number(job['end_time']), Number(job['total_duration'])],
              itemStyle : {
                normal : {
                  color : itemColor
                }
              }
            };
            console.log(jobChartInfo);
            //Добавляем созданный объект в массив данных по каждой работе для отрисовки в диаграмме
            data.push(jobChartInfo);
          }
        }
      });
      function renderItem(params,api){
        let categoryIndex = api.value(0);
        let start = api.coord([api.value(1), categoryIndex]);
        let end = api.coord([api.value(2), categoryIndex]);
        let height = api.size([0, 1])[1] * 0.6;

        let rectShape = echarts.graphic.clipRectByRect(
          {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height
          },
          {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height
          }
        );
        return (
          rectShape && {
            type: 'rect',
            transition: ['shape'],
            shape: rectShape,
            style: api.style()
          }
        );

      };


      let option={
        tooltip: {
          formatter: function (params) {
            return params.marker + params.name;
          }
        },

        title: [
          {
            text: 'Диаграмма рабочего времени',
            left: 'center',
            top: '5%'
          },

        ],
        dataZoom: [
          {
            type: 'slider',
            filterMode: 'weakFilter',
            showDataShadow: false,
            top: 400,
            labelFormatter: ''
          },
          {
            type: 'inside',
            filterMode: 'weakFilter'
          }
        ],
        grid: {
          height: 300
        },
        xAxis: {
          min: startTime,
          scale: true,
          axisLabel: {
            formatter: function (val) {
              let d=new Date();
              let u=Number(val)*1000
              d.setTime(u);
              let res=d.toLocaleString("ru-RU").split(',');
              return res[0];
            }
          }
        },
        yAxis: {
          data: categories
        },
        series: [
          {
            type: 'custom',
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: data
          }
        ]

      }

      let myChart = echarts.init(custEl);
      option && myChart.setOption(option);
    },
    transformationDate(dt){
      if (dt){
        let d=new Date();
        let u=Number(dt)*1000
        d.setTime(u);
        return d.toLocaleString("ru-RU")
      }
      return '-'
    },
  },
  mounted(){
    this.createCustomChart();
  }
};
</script>

<style scoped>

</style>
