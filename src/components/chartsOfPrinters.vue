<template>
  <q-btn @click="printerStore.setActiveTab(0)">К таблице печати</q-btn>
  <q-btn @click="printerStore.setActiveTab(6)">К диаграмме рабочего времени</q-btn>
  <div id="el"></div>

</template>

<script>
import * as echarts from 'echarts';
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';


export default {
  name: "chartsOfPrinters",
  setup(){
    const printerStore=usePrinterStore();
    const { chartsData,printers } =storeToRefs(printerStore);

    return{
      printerStore,
      chartsData,
      printers,
    }
  },

  methods: {
    start : function() {
      for (let printer of this.printers){
        this.createChart(printer.printerName);
      }
      this.createChart('sumStatistic');
    },
    //создаем диаграммы для принтера по его имени
    createChart : function(printerName) {

      let newCh=document.createElement('div');
      let el=document.querySelector('#el')

      newCh.style.height='35%';
      newCh.classList.add('fullscreen');
      newCh.style.borderStyle='solid';
      newCh.style.borderColor='black'
      el.append(newCh);
      let titleText;
      if (printerName==='sumStatistic'){
        titleText='Суммарная статистика';
      } else {
        titleText=printerName;
      }
      let option = {
        title: [
          {
            text: titleText,
            left: 'center',
            top: '5%'
          },

          {
            subtext: 'Количество',
            left: '5%',
            top: '85%',
            textAlign: 'center'
          },
          {
            subtext: 'Материал',
            left: '40%',
            top: '85%',
            textAlign: 'center'
          },
          {
            subtext: 'Время',
            left: '75%',
            top: '85%',
            textAlign: 'center'
          }
        ],

        tooltip: {
          trigger: 'item',
          valueFormatter: 'placeholder',
        },

        series: [
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['50%', '60%'],
            data:this.chartsData[printerName]['jobsCount'],
            tooltip: {
              valueFormatter: (value)=>value,
            },
            label: {
              position: 'outer',
              alignTo: 'none',
              bleedMargin: 5
            },
            left: 0,
            right: '66.6667%',
            top: 0,
            bottom: 0
          },
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['50%', '60%'],
            data:this.chartsData[printerName]['jobFilament'],
            tooltip: {
              valueFormatter: (value)=>Number(value).toFixed(2)+'м.',
            },
            label: {
              position: 'outer',
              alignTo: 'none',
              bleedMargin: 5
            },
            left: '33.3333%',
            right: '33.3333%',
            top: 0,
            bottom: 0
          },
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['50%', '60%'],
            data:this.chartsData[printerName]['jobsDuration'],
            tooltip: {
              valueFormatter: (value)=>this.printerStore.toTimeString(value),
            },
            label: {
              position: 'outer',
              alignTo: 'none',
              bleedMargin: 5
            },
            left: '66.6667%',
            right: 0,
            top: 0,
            bottom: 0
          }
        ]
      };

      let myChart = echarts.init(newCh);
      option && myChart.setOption(option);

    }
  },
  mounted() {
    this.start();
  }

};




</script>

<style scoped>

</style>
