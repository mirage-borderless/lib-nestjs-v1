import Handlebars from 'handlebars'
import * as hbs   from 'hbs'
import moment     from 'moment'

type HbsEngineType = {
  registerHelper: (name: string, fn: (...args: any[]) => any) => void
  handlebars:     typeof Handlebars
}

export const VIEW_ENGINE: HbsEngineType = hbs.create(Handlebars)
VIEW_ENGINE.registerHelper('date',      (date) => {
  return moment(date).isValid() ? moment(date).format('YYYY/MM/DD') : date
})
VIEW_ENGINE.registerHelper('increment', (value) => Number(value) + 1)
VIEW_ENGINE.registerHelper('as_html',   (text)  => new VIEW_ENGINE.handlebars.SafeString(text))
VIEW_ENGINE.registerHelper('eq',        (a, b)  => a === b)
VIEW_ENGINE.registerHelper('lt',        (a, b) => a <  b)
VIEW_ENGINE.registerHelper('lte',       (a, b) => a <= b)
VIEW_ENGINE.registerHelper('gt',        (a, b) => a >  b)
VIEW_ENGINE.registerHelper('gte',       (a, b) => a >= b)
