<template>
  <div class="q-pa-md" style="max-width: 300px">
    <div class="q-gutter-md">
      <q-select v-model="model" :options="options" label="Период" @change="installFilterPeriod" />
    </div>
  </div>
  <div v-if="isPeriodSelected">
    <select-period/>
  </div>


</template>

<script>
import { ref } from 'vue'
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';
import SelectPeriod from "components/selectPeriod.vue";



export default {
  name: "selectFilteredDates",
  components: { SelectPeriod },

  setup () {
    const printerStore=usePrinterStore();
    const {isPeriodSelected,beginningDate,endDate}=storeToRefs(printerStore);

    return {
      beginningDate,
      endDate,
      isPeriodSelected,
      printerStore,
      model: ref(null),


      options: [
        'День (текущий)', 'Месяц(текущий)', 'Год(текущий)', 'Период', 'Все время'
      ]
    }
  },
 methods : {
    installFilterPeriod : function(){
      let currentDate=new Date();
      switch (this.model){
        case 'День (текущий)':
          this.beginningDate=new Date();
          this.endDate=new Date();
          this.printerStore.updateActiveList()
          this.printerStore.setActiveTab(0);
          break;
        case 'Месяц(текущий)' :

          this.beginningDate=new Date(currentDate.getFullYear(),currentDate.getMonth(),1)
          this.endDate=new Date(currentDate.getFullYear(),currentDate.getMonth()+1,0)
          this.printerStore.updateActiveList()
          this.printerStore.setActiveTab(0);
          break
        case 'Год(текущий)' :
          this.beginningDate=new Date(currentDate.getFullYear(),0,1)
          this.endDate=new Date(currentDate.getFullYear(),11,31)
          this.printerStore.updateActiveList()
          this.printerStore.setActiveTab(0);
          break
        case 'Все время' :
          this.beginningDate=new Date(0);
          this.endDate=new Date();
          this.printerStore.updateActiveList()
          this.printerStore.setActiveTab(0);
          break
        case 'Период' :
          this.isPeriodSelected=true;
          break
      }

    }
 },
  watch : {
    model : function(){
      this.installFilterPeriod()
    }
  }

};
</script>

<style scoped>

</style>
