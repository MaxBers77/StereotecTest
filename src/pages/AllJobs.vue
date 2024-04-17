<template>

  <q-page class="flex flex-block">


    <div v-if="printerStore.activeTab===0 || printerStore.activeTab===1 || printerStore.activeTab===5">
      <div >
        <q-btn @click='printerStore.setActiveTab(1)'> Добавить файл </q-btn>
        <div v-if="printerStore.activeTab===1">
          <div class="q-pa-md">
            <div class="q-gutter-md row items-start">
              <q-input
                accept=".json"
                @update:model-value="val => { file = val[0] }"
                filled
                type="file"
                hint="Native file"
              />
            </div>
          </div>
        </div>

        <q-btn @click="printerStore.updatePrinterStatistic">Общая статистика</q-btn>

        <q-btn @click="printerStore.updateChartsData">Диаграммы</q-btn>
        <q-btn @click="printerStore.setActiveTab(5)" >Выбрать период</q-btn>
        <span>Выбран период с {{beginningDate.toLocaleDateString('ru-Ru')}} по {{endDate.toLocaleDateString('ru-Ru')}}</span>

        <q-btn @click="printerStore.reset" >Очистить статистику</q-btn>
        <selectFilteredDates v-if="printerStore.activeTab===5"/>
      </div>


      <div class="q-pa-md">
        <q-table
          style="height: min-content"
          dense
          wrap-cells
          separator="cell"
          class="my-sticky-header-table"
          title="История печати"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :pagination="initialPagination"
        />
      </div>

    </div>



    <div v-if="printerStore.activeTab===2">
      <general-statistics/>
    </div>

    <div v-if="printerStore.activeTab===3">
      <charts-of-printers/>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue'

import SelectFilteredDates from "components/selectFilteredDates.vue";
import GeneralStatistics from "components/generalStatistics.vue";
import ChartsOfPrinters from "components/chartsOfPrinters.vue";


const columns = [

  {
    name: 'printerName',
    required: true,
    label: 'Принтер',
    align: 'left',

    field: row => row.printerName,
    format: val => `${val}`,
    sortable: true,

  },
  { name: 'status', align: 'left', label: 'Статус', field: 'status' },
  { name: 'name', align: 'left', label: 'Имя', field: 'name', sortable: true },
  { name: 'filename', align: 'left', label: 'Имя файла', field: 'filename' },
  { name: 'start_time', align: 'left', label: 'Время начала', field: 'start_time', sortable: true},
  { name: 'end_time', align: 'left', label: 'Время окончания', field: 'end_time', sortable: true },
  { name: 'estimated_time', align: 'left', label: 'Расчетное время', field: 'estimated_time' },
  { name: 'print_duration', align: 'left', label: 'Время печати', field: 'print_duration' },
  { name: 'total_duration', align: 'left', label: 'Общее время', field: 'total_duration' },
  { name: 'filament_used', align: 'left', label: 'Использовано материала', field: 'filament_used' },

]








export default defineComponent({
  name: 'AllJobs',
  setup(){
    const printerStore=usePrinterStore();
    const {printers,activeList,beginningDate,endDate}=storeToRefs(printerStore);

    //Если в localStorage сохранено состояние printerStore.printers,
    //при обновлении страницы передаем его в pinia.
    const printersInLocalStorage=localStorage.getItem('printers');
    if (printersInLocalStorage){
      printerStore.printers=JSON.parse(printersInLocalStorage);
      printerStore.updateActiveList()
    }

    //Отслеживаем изменения состояния printerStore.printers и сохраняем их в localStorage
    watch(printerStore.printers,()=>{
      localStorage.setItem('printers',JSON.stringify(printerStore.printers));
    })

    const rows=activeList;
    return {
      beginningDate,
      endDate,
      printerStore,
      printers,
      file: ref(null),
      columns,
      rows,
      separator: ref('cell'),
      initialPagination: {
        rowsPerPage: 10
      },
    }
  },
  methods: {
  },


  watch:{
    file(oldFile,newFile){
      this.printerStore.addFileToStorage(this.file);
    },
  //  printers(oldFile,newFile){
   //   localStorage.setItem('printers',JSON.stringify(this.printerStore.printers));
    //  console.log('Сохраняем в локсторе')
    //},
  },deep: true,



  components : {
    ChartsOfPrinters,
    GeneralStatistics,
    SelectFilteredDates,
  }
});




</script>


<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  height: 450px
  width: 100%


  .q-table__top,

  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff




  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px


</style>
