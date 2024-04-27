import { defineStore } from 'pinia'



export const usePrinterStore = defineStore('PrinterStore', {


  state: () => ({

    printers : [],
    activeTab : 0,
    activeList : [],
    printersStatistic: [],
    globalStatistic: [],
    beginningDate : new Date(0),
    endDate : new Date(),
    isPeriodSelected: false,
    chartsData : {},
  }),

  getters: {
  },


  actions: {
    reset : function(){
      this.printers.length=0;
      this.activeTab=0;
      this.activeList.length=0;
      this.printersStatistic.length=0;
      this.globalStatistic.length=0;
      this.beginningDate=new Date(0);
      this.endDate=new Date();
      //Очищаем объект chartsData
      this.isPeriodSelected=false;
      let props = Object.getOwnPropertyNames(this.chartsData);
      for (let i = 0; i < props.length; i++) {
        delete this.chartsData[props[i]];
      }
    },
    addFileToStorage(file){
      let reader=new FileReader();
      reader.readAsText(file);
      let newPrinter;
      reader.addEventListener("load", (e)=>{
        newPrinter=JSON.parse(String(e.target.result));
        //Проверяем, содержит ли файл необходимый объект
        if (!(newPrinter.result && newPrinter.result.jobs)){
          alert('Неверный формат файла!!!')
          this.activeTab=0;
          return;
        }
        //Избегаем дублирования файлов в статистике
        for (let printer of this.printers){
          if (printer.printerName===file.name.substring(0,file.name.lastIndexOf('.'))){
            alert('Этот файл уже включен в статистику!');
            this.activeTab=0;
            return;
          }
        }
        //Добавляем в объект из JSONа имя принтера
        let printerName=file.name.substring(0,file.name.lastIndexOf('.'))
        newPrinter.printerName=printerName;
        //добавляем новый объект в storage
        this.printers.push(newPrinter)
        //обновляем activeList с учетом нового принтера
        this.updateActiveList();
        this.activeTab=0;
      })
    },
    updateActiveList(){
      //Очищаем ActiveList
      this.activeList.length=0;
      for (let printer of this.printers){
        for (let job of printer['result']['jobs']){
          //Проверяем, входит ли дата создания данной печати в период фильтрации
          let dataJob=new Date(Number(job['start_time'])*1000);
          if ((this.beginningDate===0 && this.endDate===0)||
            (dataJob>=this.beginningDate && dataJob<=this.endDate)) {


            //Создаем объект для заполнения таблицы печати
            let dataForTable = {};
            dataForTable.createdTime=job['start_time'];
            dataForTable.name = job['name'];
            dataForTable.status = job['status'];
            dataForTable.printerName = printer.printerName;
            dataForTable.filename = job['filename'];
            dataForTable.start_time = this.transformationDate(job['start_time']);
            dataForTable.end_time = this.transformationDate(job['end_time']);
            dataForTable.total_duration=this.toTimeString(job['total_duration']);
            dataForTable.total_duration_in_sec=job['total_duration'];
            dataForTable.estimated_time =this.toTimeString(job['metadata']['estimated_time']);
            dataForTable.estimated_time_in_sec=job['metadata']['estimated_time']
            dataForTable.print_duration =this.toTimeString(job['print_duration']);
            dataForTable.print_duration_in_sec=job['print_duration']
            dataForTable.filament_used =this.transformationTime(job['filament_used']);

            //Добавляем объект в список отражаемых в таблице печати
            this.activeList.push(dataForTable);
          }
        }

      }

    },
    setActiveTab(num){
      this.activeTab=num;
    },
    //Переводим секунды в чч:мм:сс
    toTimeString (sec){
      if (sec) {
        let seconds=Number(sec);
        let hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        let date = new Date(seconds % 86400 * 1000);

        let res= `${hours}:${date.toISOString().substr(14, 5)}`;
        let q=res.split(':');
        let str=q[0]+'h.'+q[1]+'m.'+q[2]+'s.'
        return str;
      }
      return '-'
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
    transformationTime(tm){
      return (Number(tm)/1000).toFixed(2);
    },
    updatePrinterStatistic : function(){
      this.printersStatistic.length=0;
      this.globalStatistic.length=0;
      this.setActiveTab(2);
      let globalDuration=0;
      let globalMaxDuration=0;
      let globalAverageDuration=0;
      let globalMaterialConsumption=0;
      let globalCountOfJob=0;

      let row1={rowName : 'Имя принтера'};
      let row2={rowName : 'Общее время печати'};
      let row3={rowName : 'Наибольшее время печати'};
      let row4={rowName : 'Среднее время печати'};
      let row5={rowName : 'Использованно материала'};
      let row6={rowName : 'Всего заданий на печать'}
      for (let printer of this.printers){
        let generalDuration=0;
        let maxDuration=0;
        let averageDuration=0;
        let totalMaterialConsumption=0;
        let countOfJob=0;
        for (let job of this.activeList){
          if (job.printerName===printer.printerName){
            generalDuration+=Number(job.print_duration_in_sec);
            globalDuration+=Number(job.print_duration_in_sec);
            if (Number(job.print_duration_in_sec)>maxDuration){
              maxDuration=Number(job.print_duration_in_sec);
            }
            if (Number(job.print_duration_in_sec)>globalMaxDuration){
              globalMaxDuration=Number(job.print_duration_in_sec);
            }
            totalMaterialConsumption+=Number(job.filament_used);
            globalMaterialConsumption+=Number(job.filament_used);
            countOfJob++;
            globalCountOfJob++;
          }
        }
        averageDuration=(generalDuration/countOfJob).toFixed(2);

        row1[printer.printerName+'_']=printer.printerName;
        row2[printer.printerName+'_']=this.toTimeString(generalDuration);
        row3[printer.printerName+'_']=this.toTimeString(maxDuration);
        row4[printer.printerName+'_']=this.toTimeString(averageDuration);
        row5[printer.printerName+'_']=totalMaterialConsumption.toFixed(2);
        row6[printer.printerName+'_']=countOfJob;
      }
      this.printersStatistic.push(row1,row2,row3,row4,row5,row6);

      //Создаем суммарную статистику
      globalAverageDuration=(globalDuration/globalCountOfJob).toFixed(2)
      let gRow1={rowName : 'Количество принтеров', value : this.printers.length};
      let grow2={rowName : 'Общее время печати', value: this.toTimeString(globalDuration)};
      let gRow3={rowName : 'Наибольшее время печати', value: this.toTimeString(globalMaxDuration)};
      let gRow4={rowName : 'Среднее время печати', value: this.toTimeString(globalAverageDuration)};
      let gRow5={rowName : 'Использованно материала', value: globalMaterialConsumption.toFixed(2)};
      let gRow6={rowName : 'Всего заданий на печать', value: globalCountOfJob};
      this.globalStatistic.push(gRow1,grow2,gRow3,gRow4,gRow5,gRow6);
    },

    //Формируем данные для графика принтера по переданному имени
    updateChartsData : function() {
      this.setActiveTab(3)

      let sumCompletedJobsCount= 0, sumCompletedJobsFilament = 0, sumCancelledJobsCount = 0, sumCancelledJobsFilament = 0
      let sumFailedJobsCount = 0, sumFailedJobsFilament = 0, sumErroredJobsCount = 0, sumErroredJobsFilament = 0;
      let sumGlobalDuration=0;
      let sumInactionTime=0;
      for (let printer of this.printers) {


        let completedJobsCount = 0, completedJobsFilament = 0, cancelledJobsCount = 0, cancelledJobsFilament = 0
        let failedJobsCount = 0, failedJobsFilament = 0, erroredJobsCount = 0, erroredJobsFilament = 0;
        let startTimeOfFirstJob=0;
        let startTimeOfLastJob=0;
        let globalDuration=0;



        for (let job of this.activeList) {
          if (job.printerName === printer.printerName) {
            if(job.createdTime && (startTimeOfFirstJob===0 || startTimeOfFirstJob>Number(job.createdTime))){
              startTimeOfFirstJob=Number(job.createdTime);
            }
            if(job.createdTime && (startTimeOfLastJob===0 || startTimeOfLastJob<Number(job.createdTime))){
              startTimeOfLastJob=Number(job.createdTime);
            }
            globalDuration+=Number(job.print_duration_in_sec);
            sumGlobalDuration+=Number(job.print_duration_in_sec);
            switch (job['status']) {
              case 'completed' :
                completedJobsCount++;
                sumCompletedJobsCount++;
                completedJobsFilament += Number(job.filament_used);
                sumCompletedJobsFilament+=Number(job.filament_used);
                break;
              case 'cancelled':
                cancelledJobsCount++;
                sumCancelledJobsCount++;
                cancelledJobsFilament += Number(job.filament_used);
                sumCancelledJobsFilament+=Number(job.filament_used);
                break;
              case 'failed':
                failedJobsCount++;
                sumFailedJobsCount++;
                failedJobsFilament+= Number(job.filament_used);
                sumFailedJobsFilament+=Number(job.filament_used);
                break;
              default :
                erroredJobsCount++;
                sumErroredJobsCount++;
                erroredJobsFilament+= Number(job.filament_used);
                sumErroredJobsFilament+=Number(job.filament_used);
            }
          }
        }

        //Вычисляем период, за который сохранена статистика по этому принтеру в activeList
        let fd=new Date(startTimeOfFirstJob*1000);
        let ed=new Date(startTimeOfLastJob*1000);
        let totalJobsDuration=ed-fd;
        //Вычисляем время бездействия
          let inactionTime=totalJobsDuration/1000-globalDuration;
          sumInactionTime+=inactionTime;

        this.chartsData[printer.printerName]={jobsCount :[
            {value : completedJobsCount, name: 'Завершено'},
            {value : cancelledJobsCount, name: 'Отменено'},
            {value : failedJobsCount, name: 'Ошибка'},
            {value : erroredJobsCount, name: 'Аварийная остановка'}
          ],
        jobFilament : [
          {value : completedJobsFilament, name: 'Завершено'},
          {value : cancelledJobsFilament, name: 'Отменено'},
          {value : failedJobsFilament, name: 'Ошибка'},
          {value : erroredJobsFilament, name: 'Аварийная остановка'}
        ],
        jobsDuration : [
          { value: inactionTime, name: 'Бездействие' },
          {value: globalDuration, name: 'Завершено'}
        ]};


      }

      //Добавляем в chartsData суммарную статистику по всем принтерам
      this.chartsData['sumStatistic']={
        jobsCount :[
          {value : sumCompletedJobsCount, name: 'Завершено'},
          {value : sumCancelledJobsCount, name: 'Отменено'},
          {value : sumFailedJobsCount, name: 'Ошибка'},
          {value : sumErroredJobsCount, name: 'Аварийная остановка'}
        ],
        jobFilament : [
          {value : sumCompletedJobsFilament, name: 'Завершено'},
          {value : sumCancelledJobsFilament, name: 'Отменено'},
          {value : sumFailedJobsFilament, name: 'Ошибка'},
          {value : sumErroredJobsFilament, name: 'Аварийная остановка'}
        ],
        jobsDuration : [
          { value: sumInactionTime, name: 'Бездействие' },
          {value: sumGlobalDuration, name: 'Завершено'}
        ]
      }




    },
  }
})
