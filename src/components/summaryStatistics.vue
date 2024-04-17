<template>
  <div class="q-pa-md" >
    <q-table
      style="height: min-content"
      wrap-cells
      dense
      separator="cell"
      class="my-sticky-header-table"
      title="Суммарная статистика"
      :rows="rows"
      row-key="rowName"
      hide-header
      hide-bottom
      :pagination="initialPagination"
    />
  </div>
</template>

<script>
import {usePrinterStore} from "stores/printers"
import { storeToRefs } from 'pinia';



export default {
  name: "summaryStatistics",
  setup(){
    const printerStore=usePrinterStore();
    const { globalStatistic } =storeToRefs(printerStore);
    const rows=globalStatistic;

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
