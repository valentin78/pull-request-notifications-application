import {Pipe, PipeTransform} from '@angular/core';
import {isPresent} from '../core/utils';

@Pipe({
  name: 'toKeyValue',
  standalone: true
})
export class ToKeyValuePipe implements PipeTransform {
  transform(value: any, sortExpression?: (a: any, b: any) => number): any[] {
    let keys: {key: string, value: any}[] = [];
    Object.keys(value).sort().forEach(key => {
      if (value.hasOwnProperty(key) && isPresent(value[key])) {
        keys.push({key: key, value: value[key]});
      }
    });

    if (sortExpression) {
      keys = keys.sort((a, b) => sortExpression(a.value, b.value));
    }

    return keys;
  }
}
