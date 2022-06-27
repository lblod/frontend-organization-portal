import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class HistoryController extends Controller {
  @tracked
  page = 0;
  size = 10;
  @tracked
  hours = 0;
  @tracked
  minutes = 0;
  @tracked
  seconds = 0;
  @tracked
  date;

  @action
  onDateChange(date) {
    console.log(`${date} changed`);
  }
  @action
  onTimeChange(time) {
    console.log(`${JSON.stringify(time)} changed`);
  }

  get histories() {
    return this.model.history;
    // return this.model.loadHistoriesTaskInstance.isFinished
    //   ? this.model.loadHistoriesTaskInstance.value
    //   : this.model.loadedHistoriesTask;
  }

  get isLoading() {
    // return this.model.loadHistoriesTaskInstance.isRunning;
    return false;
  }

  get hasPreviousData() {
    return this.model.history && this.model.history.length > 0;
    // return (
    //   this.model.loadedHistoriesTask &&
    //   this.model.loadedHistoriesTask.length > 0
    // );
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return this.model.history && this.model.history.length === 0;

    // return (
    //   this.model.loadHistoriesTaskInstance.isFinished &&
    //   this.administrativeUnits.length === 0
    // );
  }

  get hasErrored() {
    // return this.model.loadHistoriesTaskInstance.isError;
    return false;
  }
}
