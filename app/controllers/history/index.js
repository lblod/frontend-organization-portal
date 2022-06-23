import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class HistoryIndexController extends Controller {
  @tracked
  page = 0;
  size = 10;

  get histories() {
    console.log('test');
    return this.model.loadHistoriesTaskInstance.isFinished
      ? this.model.loadHistoriesTaskInstance.value
      : this.model.loadedHistoriesTask;
  }

  get isLoading() {
    return this.model.loadHistoriesTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return (
      this.model.loadedHistoriesTask &&
      this.model.loadedHistoriesTask.length > 0
    );
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return (
      this.model.loadHistoriesTaskInstance.isFinished &&
      this.administrativeUnits.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadHistoriesTaskInstance.isError;
  }
}
