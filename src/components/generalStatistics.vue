<template>
  <div>
    <q-btn @click="printerStore.setActiveTab(0)">К таблице печати</q-btn>
  </div>

  <div class="q-pa-md" >
    <q-table
      style="height: min-content"
      wrap-cells
      dense
      separator="cell"
      class="my-sticky-header-table"
      title="Общая статистика"
      :rows="rows"
      row-key="rowName"
      hide-header
      hide-bottom
      :pagination="initialPagination"
    />
  </div>

  <summary-statistics/>


</template>

<script>
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';
import SummaryStatistics from "components/summaryStatistics.vue";

export default {
  name: "generalStatistics",
  components: { SummaryStatistics },
  setup(){
    const printerStore=usePrinterStore();
    const { printersStatistic } =storeToRefs(printerStore);
    const rows=printersStatistic;

    return{
      rows,
      printerStore,
      initialPagination: {
        rowsPerPage: 6
      },
    }
  }
};
</script>

<style scoped>

</style>
