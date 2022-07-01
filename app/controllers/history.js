import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class HistoryController extends Controller {
  @service router;

  @tracked
  page = 0;
  size = 10;
  @tracked
  fromDate;
  @tracked
  toDate;

  @action
  filter(ev) {
    ev.preventDefault();
    if (!this.fromDate?.length || !this.toDate?.length) {
      this.router.transitionTo({
        queryParams: { page: 0, size: 10, fromDate: null, toDate: null },
      });
    } else {
      if (!(this.fromDate instanceof Date)) {
        this.fromDate = new Date(this.fromDate);
      }
      if (!(this.toDate instanceof Date)) {
        this.toDate = new Date(this.toDate);
      }

      this.router.transitionTo({
        queryParams: {
          page: 0,
          size: 10,
          fromDate: this.fromDate?.toISOString()?.slice(0, -5) || null,
          toDate: this.toDate?.toISOString()?.slice(0, -5) || null,
        },
      });
    }
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
