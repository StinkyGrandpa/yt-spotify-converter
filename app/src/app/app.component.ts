import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as querystring from 'query-string';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'app';

  private client_id: string = "52b5a2676ba940f8922f7b62fe0679c0";
  private scope: string = "playlist-read-private playlist-read-collaborative";

  private token : string = "";

  constructor(private currentRoute: ActivatedRoute, private httpclient: HttpClient){}

  public async loginWithSpotify(): Promise<void> {
    const data = {
      response_type: 'code',
      client_id: this.client_id,
      scope: this.scope,
      redirect_uri: "http://localhost:4200",
      state: "veryRandomString123"
    }
    
    window.location.href = "https://accounts.spotify.com/authorize?" + querystring.stringify(data);
  }

  public async ngOnInit(): Promise<void> {
    this.currentRoute.queryParams.subscribe((map) => {
      this.token =map.code ;
      console.log(this.token);
    })

  }

  public name:String ="";

  public async hello() : Promise<void>{

    const fakeTOken: string = "BQAItLtIVW9J4lSau5-i9UFFmb3qGl54gKsFfqgjzgef5NSlnMMuzSkhBFMLyY_mKjs9aZ6iB4qSKSIcqGj6QOF_pTxAGUJ0_tnmXpzBZUP1deI91wL315YV6zp7MPLh76kZlsQ7dFyIAcHLUrzdsg0kBG7N_bwAJglO0jQmoiyS";

    const opts = {
      headers : new HttpHeaders({
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + fakeTOken
      })
    }
    this.httpclient.get("https://api.spotify.com/v1/me",opts).toPromise().then(data=>
    {
      this.name = Object.getOwnPropertyDescriptor(data,'display_name')?.value ;
      console.log(this.name);
    }
    )
  } 
}
