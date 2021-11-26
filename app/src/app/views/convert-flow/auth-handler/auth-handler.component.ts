import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription, zip } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Platform } from 'src/app/model/platform.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FlowService } from 'src/app/services/flow.service';

@Component({
  selector: 'app-auth-handler',
  templateUrl: './auth-handler.component.html',
  styleUrls: ['./auth-handler.component.scss']
})
export class AuthHandlerComponent implements OnInit, OnDestroy {

  public platformName: string;
  public isCheckingSession: boolean = true;
  public ngLottieAnimOptions: AnimationOptions = {
    loop: true,
    autoplay: true,
    path: "/assets/animated/loader.json"
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private authService: AuthenticationService,
    private flowService: FlowService
  ) { }
  

  private activeSubscriber: Subscription[] = [];

  public ngOnInit(): void {
    console.log("auth-hander oninit")

    // Notify component that session is being checked on
    this.isCheckingSession = true;

    // zip() Operator causes to emit value if every observable has released some data. So this chains them all together.
    // Authservice ready is filtered, so that only true values come through, so that this observable only emits if auth service is actually ready, causing
    // the whole observable (zip) to hold until this one is ready.
    // The map at the end maps all the values from zip() into an object
    zip(this.authService.$ready.pipe(filter((ready) => ready)), this.route.paramMap, this.route.queryParamMap, this.flowService.$currentFlow.pipe(filter((flow) => !!flow))).pipe(map(([ready, params, queryParams, flow]) => ({ ready, params, queryParams, flow }))).subscribe((result) => {
      // Only proceed if session init and so on is ready
      if(!result.ready) return;
      
      // Turn off loader in the component
      this.isCheckingSession = false;

      const platform = result.params.get("platform") as Platform;
      const grantCode = result.queryParams.get("code")

      if(!grantCode) {
        if(!this.authService.hasValidSession()) {
          // This step was accessed by flow itself 
          // Redirect to platform authorize window.
          console.log(`[AUTH-HANDLER] [${platform.toUpperCase()}] Found no grantCode in url: Redirecting to '${platform}' login`);
          this.authService.requestSpotifyGrantCode()
        } else {
          // There is an existing valid session, can skip reauthenticating
          this.authService.findUser(platform).then((user) => {
            this.flowService.nextStep();
          })
        }
      } else {
        // Handle login etc
        console.log(`[AUTH-HANDLER] [${platform.toUpperCase()}] Found grantCode: Requesting accessToken and user data...`);

        this.authService.requestSpotifyAccessToken(grantCode).then((token) => {
          this.authService.createSpotifyOrientedSession(token).then(() => {
            this.authService.findUser(platform).then(() => {
              this.flowService.nextStep()
            })
          })
        })
      }

      /*if(!result.ready) return;
      if(!result.flow.isActive) this.flowService.abort();
      this.isCheckingSession = false;

      if(this.authService.hasValidSession()) {
        // TODO: Show info to user or skip step (Message can be shown on the very start of the flow)
        console.log("no need to authenticate, session exists")
        setTimeout(() => this.flowService.nextStep(), 500)
        return;
      }

      const platform = result.params.get("platform");
      if(platform == "spotify") {
        const grantCode = this.route.snapshot.queryParamMap.get("code")
        this.platformName = platform;

        if(grantCode) {
          this.authService.requestSpotifyAccessToken(grantCode).then((token) => {
              console.log(token)
              this.authService.createSpotifyOrientedSession(token).then((session) => {
                console.log(session)
                // setTimeout(() => this.flowService.nextStep(), 500)
              })
          }).catch(() => {})          
        } else {
          this.authService.requestSpotifyGrantCode()
        }
      } else {
        // TODO: Show error --> platform name not found, therefor not supported
      }*/
    })
  }

  public ngOnDestroy(): void {
    this.activeSubscriber.forEach((sub) => sub.unsubscribe())
  }

  

}
