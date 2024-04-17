<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-date
        v-model="bd"
        minimal
      />

      <q-date
        v-model="ed"
        minimal
      />
    </div>
  </div>



  <q-btn @click="installPeriod">Применить</q-btn>
</template>

<script>
import { onMounted, ref } from "vue";
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';


export default {
  name: "selectPeriod",
  setup () {
    const printerStore=usePrinterStore();
    const {beginningDate,endDate,isPeriodSelected}=storeToRefs(printerStore);

    //Формируем строку для инициации стартовых данных выбора периода
    let beginningDateInStr=printerStore.beginningDate.toLocaleDateString();
    let endDateInStr=printerStore.endDate.toLocaleDateString();
    let bDISArr=beginningDateInStr.split('.');
    let eDISArr=endDateInStr.split('.');
    beginningDateInStr=bDISArr[2]+'/'+bDISArr[1]+'/'+bDISArr[0];
    endDateInStr=eDISArr[2]+"/"+eDISArr[1]+'/'+eDISArr[0];

    return {
      beginningDate,
      endDate,
      isPeriodSelected,
      printerStore,
      bd : ref(beginningDateInStr),
      ed: ref(endDateInStr),
    }
  },
  methods: {
    installPeriod: function(){
      //Проверяем корректность выбранного периода
      let newBeginningDate=new Date(this.bd);
      let newEndDate=new Date(this.ed);
      if (newBeginningDate>newEndDate){
        alert('Выбран неккоректный период! Дата начала периода позже даты окончания!');
        this.printerStore.setActiveTab(0);
        return;
      }
      //Устанавливаем новый период в storage
      this.beginningDate=new Date(this.bd);
      this.endDate=new Date(this.ed);
      this.isPeriodSelected=false;
      this.printerStore.updateActiveList();
      this.printerStore.setActiveTab(0);
    }
  }
};
</script>

<style scoped>

</style>
